import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-MANAGEMENT] ${step}${detailsStr}`);
};

// Price calculation logic
function calculateOrderTotal(order: any): {
  unitCost: number;
  quantity: number;
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
} {
  const unitCost = order.price || 18.50; // Default unit cost
  const quantity = order.quantity || 100;
  const subtotal = unitCost * quantity;
  
  // Shipping calculation based on quantity
  let shipping = 450; // Base shipping
  if (quantity > 500) shipping = 750;
  if (quantity > 1000) shipping = 1200;
  
  // Tax calculation (simplified - 5% of subtotal)
  const taxes = subtotal * 0.05;
  
  const total = subtotal + shipping + taxes;
  
  return { unitCost, quantity, subtotal, shipping, taxes, total };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
  
  logStep("Creating checkout session", { orderId: order.id, total: costs.total });
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Manufacturing Order - ${order.designs?.name || 'Design'}`,
            description: `${costs.quantity} units @ $${costs.unitCost.toFixed(2)} each`,
          },
          unit_amount: Math.round(costs.subtotal * 100), // Convert to cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling',
          },
          unit_amount: Math.round(costs.shipping * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Taxes & Fees',
          },
          unit_amount: Math.round(costs.taxes * 100),
        },
        quantity: 1,
      }
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
    costs 
  };
}

async function verifyPayment(supabase: any, userId: string, params: any) {
  const { session_id, order_id } = params;
  
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) throw new Error("Stripe is not configured");
  
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  
  const session = await stripe.checkout.sessions.retrieve(session_id);
  
  if (session.payment_status === 'paid') {
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'sample_development',
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id);
    
    if (error) throw error;
    
    return { paid: true, status: 'sample_development' };
  }
  
  return { paid: false, status: session.payment_status };
}
