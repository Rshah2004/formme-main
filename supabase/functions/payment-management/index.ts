import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  commission: number;
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
  const commission = timelineData?.commission_cost || 0;
  
  const subtotal = unitCost * quantity;
  const total = subtotal + shipping + taxes + commission;
  
  return { unitCost, quantity, subtotal, shipping, taxes, commission, total };
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

    if (req.method === "GET") {
      const url = new URL(req.url);
      const orderId = url.searchParams.get("order_id");
      const token = url.searchParams.get("token");
      const decision = url.searchParams.get("decision");
      if (orderId && token && decision) {
        const result = await reviewPaymentProof(supabaseClient, {
          order_id: orderId,
          token,
          decision,
        });
        return new Response(result.message, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
          status: result.ok ? 200 : 400,
        });
      }
      return new Response("Invalid review link.", { status: 400 });
    }

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
      case "submit_payment_proof":
        result = await submitPaymentProof(supabaseClient, user.id, params, req);
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

async function submitPaymentProof(supabase: any, userId: string, params: any, req: Request) {
  const { order_id, design_id, proof_url } = params;

  if (!proof_url) throw new Error("Proof URL is required");

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

  const timelineData = order.production_timeline_data
    ? (typeof order.production_timeline_data === "string"
        ? JSON.parse(order.production_timeline_data)
        : order.production_timeline_data)
    : {};

  const payment = timelineData.payment || {};
  if (payment.status === "approved") {
    throw new Error("Payment already approved.");
  }

  const approvalToken = crypto.randomUUID();
  payment.method = "interac";
  payment.status = "pending";
  payment.proof_url = proof_url;
  payment.submitted_at = new Date().toISOString();
  payment.approval_token = approvalToken;
  timelineData.payment = payment;

  const { error } = await supabase
    .from('orders')
    .update({ production_timeline_data: timelineData, updated_at: new Date().toISOString() })
    .eq('id', order.id);
  if (error) throw error;

  const costs = calculateOrderTotal(order);

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const brandName = profile?.company_name || profile?.full_name || "Unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const ref = (() => {
      try {
        const host = new URL(supabaseUrl).hostname;
        return host.split(".")[0];
      } catch {
        return "";
      }
    })();
    const functionBase = ref ? `https://${ref}.functions.supabase.co/payment-management` : "";
    const approveLink = functionBase
      ? `${functionBase}?order_id=${order.id}&token=${approvalToken}&decision=approve`
      : "";
    const rejectLink = functionBase
      ? `${functionBase}?order_id=${order.id}&token=${approvalToken}&decision=reject`
      : "";

    await sendResendEmail({
      from: "Formme <payments@formme.io>",
      to: ["formestartup22@gmail.com"],
      subject: `Interac payment proof submitted — ${brandName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color:#1f2937;">
          <h2 style="color:#344C3D;">Interac Payment Proof</h2>
          <p><strong>Brand:</strong> ${brandName}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Amount:</strong> $${costs.total.toFixed(2)}</p>
          <p><strong>Proof:</strong> <a href="${proof_url}" target="_blank" rel="noreferrer">View upload</a></p>
          ${approveLink ? `<p><a href="${approveLink}">Approve payment</a> | <a href="${rejectLink}">Reject payment</a></p>` : ""}
        </div>
      `,
    });
  } catch (emailError) {
    logStep("Payment proof email failed", { message: String(emailError) });
  }

  return { status: "pending" };
}

async function reviewPaymentProof(supabase: any, params: any) {
  const { order_id, token, decision } = params;

  if (!order_id || !token) return { ok: false, message: "Missing review token." };
  if (decision !== "approve" && decision !== "reject") {
    return { ok: false, message: "Invalid decision." };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("production_timeline_data, designer_id, designs(name)")
    .eq("id", order_id)
    .single();
  if (error || !order) return { ok: false, message: "Order not found." };

  const timelineData = order.production_timeline_data
    ? (typeof order.production_timeline_data === "string"
        ? JSON.parse(order.production_timeline_data)
        : order.production_timeline_data)
    : {};
  const payment = timelineData.payment || {};

  if (!payment.approval_token || payment.approval_token !== token) {
    return { ok: false, message: "Invalid or expired token." };
  }

  payment.status = decision === "approve" ? "approved" : "rejected";
  payment.reviewed_at = new Date().toISOString();
  payment.reviewed_by = "email_link";
  timelineData.payment = payment;

  const updatePayload: any = {
    production_timeline_data: timelineData,
    updated_at: new Date().toISOString(),
  };
  if (decision === "approve") {
    updatePayload.status = "sample_development";
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", order_id);
  if (updateError) return { ok: false, message: "Failed to update order." };

  if (decision === "approve") {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(order.designer_id);
      const email = userData?.user?.email;
      if (email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_name, full_name")
          .eq("user_id", order.designer_id)
          .maybeSingle();

        const brandName = profile?.company_name || profile?.full_name || "there";

        await sendResendEmail({
          from: "Formme <payments@formme.io>",
          to: [email],
          subject: "Payment received — your project is in progress",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color:#1f2937;">
              <p><strong>Formme</strong></p>
              <p>Hi ${brandName},</p>
              <p>Thanks for completing your payment on Formme. Your project is now officially in progress.</p>
              <p><strong>Here’s what happens next:</strong></p>
              <p><strong>Sampling</strong><br/>The manufacturer will create and submit samples for your review. Once submitted, you can review them directly on the platform and flag any issues or request changes.</p>
              <p><strong>Production</strong><br/>After samples are approved, production begins. You’ll be able to track production progress and timelines in real time.</p>
              <p><strong>Quality Check</strong><br/>Once production is completed, a quality check is conducted. If you notice any issues, you can flag them immediately so they’re addressed before shipping.</p>
              <p><strong>Shipping & Delivery Tracking</strong><br/>After quality approval, shipping details and delivery tracking will be available on Formme until the order reaches you.</p>
              <p>At any point, you can use Formme’s built-in messaging system to communicate directly with your manufacturer—no emails or external tools needed.</p>
              <p>If you have questions or need help at any stage, feel free to reach out.</p>
              <p>Thanks for using Formme.<br/>— The Formme Team</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      logStep("Approval email failed", { message: String(emailError) });
    }
  }

  return {
    ok: true,
    message:
      decision === "approve"
        ? "Payment approved. Sampling is now unlocked."
        : "Payment rejected.",
  };
}
