import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const allowedOrigins = new Set(["https://www.formme.io", "http://localhost:8080"]);
const buildCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://www.formme.io",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-MANAGEMENT] ${step}${detailsStr}`);
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendResendEmail(payload: Record<string, unknown>) {
  if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `Email request failed (status ${res.status}).`;
    throw new Error(message);
  }

  return data;
}

// Price calculation logic - uses manufacturer-set pricing from production_timeline_data
function calculateOrderTotal(order: any): {
  unitCost: number;
  quantity: number;
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
} {
  // Parse production_timeline_data for manufacturer pricing
  let timelineData = null;
  if (order.production_timeline_data) {
    try {
      timelineData = typeof order.production_timeline_data === 'string' 
        ? JSON.parse(order.production_timeline_data) 
        : order.production_timeline_data;
    } catch (e) {
      console.error('[PAYMENT-MANAGEMENT] Error parsing timeline data:', e);
    }
  }

  const quantity = order.quantity || 100;
  
  // Use manufacturer-set pricing if available, otherwise fall back to defaults
  const unitCost = timelineData?.unit_cost || order.price || 0;
  const shipping = timelineData?.shipping_cost || 0;
  const taxes = timelineData?.taxes_and_fees || 0;
  
  const subtotal = unitCost * quantity;
  const total = subtotal + shipping + taxes;
  
  return { unitCost, quantity, subtotal, shipping, taxes, total };
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response("ok", {
      status: 200,
      headers: buildCorsHeaders(origin),
    });
  }


  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { action, ...params } = await req.json();
    logStep("Action requested", { action });

    let result: any;

    switch (action) {
      case "calculate_order_cost":
        result = await calculateOrderCost(supabaseClient, user.id, params);
        break;
      case "create_checkout":
        result = await createCheckoutSession(supabaseClient, user.id, params, req);
        break;
      case "verify_payment":
        result = await verifyPayment(supabaseClient, user.id, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...buildCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...buildCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function calculateOrderCost(supabase: any, userId: string, params: any) {
  const { order_id, design_id } = params;
  
  let order;
  
  if (order_id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, manufacturers(name)')
      .eq('id', order_id)
      .single();
    
    if (error) throw error;
    if (data.designer_id !== userId) throw new Error("Not authorized");
    order = data;
  } else if (design_id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, manufacturers(name)')
      .eq('design_id', design_id)
      .not('manufacturer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    if (data && data.designer_id !== userId) throw new Error("Not authorized");
    order = data;
  }
  
  if (!order) throw new Error("Order not found");
  
  const costs = calculateOrderTotal(order);
  
  return {
    ...costs,
    manufacturer_name: order.manufacturers?.name,
    order_id: order.id
  };
}

async function createCheckoutSession(supabase: any, userId: string, params: any, req: Request) {
  const { order_id, design_id, success_url, cancel_url } = params;
  
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("Stripe is not configured");
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  // Get order
  let order;
  if (order_id) {
    const { data } = await supabase
      .from('orders')
      .select('*, designs(name), manufacturers(name)')
      .eq('id', order_id)
      .single();
    order = data;
  } else if (design_id) {
    const { data } = await supabase
      .from('orders')
      .select('*, designs(name), manufacturers(name)')
      .eq('design_id', design_id)
      .not('manufacturer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    order = data;
  }
  
  if (!order) throw new Error("Order not found");
  if (order.designer_id !== userId) throw new Error("Not authorized");

  const costs = calculateOrderTotal(order);
  const origin = req.headers.get("origin") || "http://localhost:5173";

  const timelineData = order.production_timeline_data
    ? (typeof order.production_timeline_data === "string"
        ? JSON.parse(order.production_timeline_data)
        : order.production_timeline_data)
    : {};
  const payment = timelineData.payment || {};

  if (payment.paid === true) {
    throw new Error("Payment already completed.");
  }

  const chargeAmount = Math.round(costs.total * 100) / 100;
  if (chargeAmount <= 0) throw new Error("Invalid payment amount");
  
  logStep("Creating checkout session", { orderId: order.id, total: costs.total });
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Payment - ${order.designs?.name || 'Design'}`,
            description: `${costs.quantity} units @ $${costs.unitCost.toFixed(2)} each`,
          },
          unit_amount: Math.round(chargeAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: success_url || `${origin}/workflow?designId=${order.design_id}&stage=sample`,
    cancel_url: cancel_url || `${origin}/workflow?designId=${order.design_id}&stage=payment`,
    metadata: {
      order_id: order.id,
      design_id: order.design_id,
      user_id: userId
    },
  });

  logStep("Checkout session created", { sessionId: session.id });
  
  return { 
    sessionId: session.id, 
    url: session.url,
    costs: {
      ...costs
    }
  };
}

async function verifyPayment(supabase: any, userId: string, params: any) {
  const { session_id, order_id } = params;
  
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("Stripe is not configured");
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  const session = await stripe.checkout.sessions.retrieve(session_id);
  
  if (session.payment_status === 'paid') {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, designs(name), manufacturers(name)')
      .eq('id', order_id)
      .single();
    if (orderError) throw orderError;

    const timelineData = order?.production_timeline_data
      ? (typeof order.production_timeline_data === 'string'
          ? JSON.parse(order.production_timeline_data)
          : order.production_timeline_data)
      : {};

    const payment = timelineData.payment || {};
    payment.paid = true;
    payment.paid_at = new Date().toISOString();
    timelineData.payment = payment;

    const updatePayload: any = {
      production_timeline_data: timelineData,
      updated_at: new Date().toISOString(),
    };

    updatePayload.status = 'sample_development';

    const costs = calculateOrderTotal(order);

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', order_id);
    if (error) throw error;

    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email;
      let brandName = "there";
      if (email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name, full_name")
          .eq("user_id", userId)
          .maybeSingle();

        brandName = profile?.company_name || profile?.full_name || "there";

        await sendResendEmail({
          from: "Formme <payments@formme.io>",
          to: [email],
          subject: "Payment received — your project is in progress",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color:#1f2937;">
              <div style="padding: 16px 0 8px 0;">
                <img src="https://www.formme.io/logo.png" alt="Formme" style="height: 32px; width: auto;" />
              </div>
              <p>Hi ${brandName},</p>
              <p>Thanks for completing your payment on Formme. Your project is now officially in progress.</p>
              <p><strong>Here’s what happens next:</strong></p>
              <ol>
                <li><strong>Sampling</strong><br/>The manufacturer will create and submit samples for your review. Once submitted, you can review them directly on the platform and flag any issues or request changes.</li>
                <li><strong>Production</strong><br/>After samples are approved, production begins. You’ll be able to track production progress and timelines in real time.</li>
                <li><strong>Quality Check</strong><br/>Once production is completed, a quality check is conducted. If you notice any issues, you can flag them immediately so they’re addressed before shipping.</li>
                <li><strong>Shipping & Delivery Tracking</strong><br/>After quality approval, shipping details and delivery tracking will be available on Formme until the order reaches you.</li>
              </ol>
              <p>At any point, you can use Formme’s built-in messaging system to communicate directly with your manufacturer—no emails or external tools needed.</p>
              <p>If you have questions or need help at any stage, feel free to reach out.</p>
              <p>Thanks for using Formme.<br/>— The Formme Team</p>
            </div>
          `,
        });
      }

      await sendResendEmail({
        from: "Formme <payments@formme.io>",
        to: ["formme.design@gmail.com"],
        subject: `Payment received — ${brandName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color:#1f2937;">
            <h2 style="color:#344C3D;">Payment Received</h2>
            <p><strong>Brand:</strong> ${brandName}</p>
            <p><strong>Payer:</strong> ${email || "Unknown"}</p>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Amount:</strong> $${costs.total.toFixed(2)}</p>
          </div>
        `,
      });
    } catch (emailError) {
      logStep("Payment confirmation email failed", { message: String(emailError) });
    }

    return { paid: true, status: updatePayload.status || 'paid' };
  }
  
  return { paid: false, status: session.payment_status };
}
