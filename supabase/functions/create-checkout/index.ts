import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.formme.io",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
   if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, successUrl, cancelUrl } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('[create-checkout] Creating checkout session for order:', orderId);

    // For now, create a sample product/price
    // In production, you'd fetch the actual order details and pricing
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Manufacturing Order',
              description: `Payment for order ${orderId}`,
            },
            unit_amount: 50000, // $500.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/workflow?designId=${orderId}&stage=production`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/workflow?designId=${orderId}&stage=payment`,
      metadata: {
        orderId: orderId,
      },
    });

    console.log('[create-checkout] Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('[create-checkout] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
