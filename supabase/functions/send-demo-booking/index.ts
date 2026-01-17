import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DemoBookingRequest {
  name: string;
  email: string;
  date: string;
  time: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, date, time }: DemoBookingRequest = await req.json();

    console.log("Received demo booking request:", { name, email, date, time });

    // Send email to the team
    const teamEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Forme <onboarding@resend.dev>",
        to: ["formestartup22@gmail.com", "rythemshah2004@gmail.com"],
        subject: `New Demo Booking Request from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #344C3D;">New Demo Booking Request</h1>
            <p>A new demo has been requested with the following details:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Requested Date:</strong> ${date}</p>
              <p><strong>Requested Time:</strong> ${time}</p>
            </div>
            
            <p>Please reach out to the customer to confirm the demo appointment.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated email from Forme.
            </p>
          </div>
        `,
      }),
    });

    const teamEmailData = await teamEmailRes.json();
    console.log("Team email sent:", teamEmailData);

    // Send confirmation email to the customer
    const customerEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Forme <onboarding@resend.dev>",
        to: [email],
        subject: "Your Demo Request Has Been Received - Forme",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #344C3D;">Thank You for Your Interest!</h1>
            <p>Hi ${name},</p>
            <p>We've received your demo booking request and we're excited to show you what Forme can do for your fashion designs.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your Name:</strong> ${name}</p>
              <p><strong>Your Email:</strong> ${email}</p>
              <p><strong>Requested Date:</strong> ${date}</p>
              <p><strong>Requested Time:</strong> ${time}</p>
            </div>
            
            <p>Our team will reach out to you shortly to confirm the appointment.</p>
            
            <p>Best regards,<br>The Forme Team</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you have any questions, feel free to reply to this email or contact us at formestartup22@gmail.com
            </p>
          </div>
        `,
      }),
    });

    const customerEmailData = await customerEmailRes.json();
    console.log("Customer email sent:", customerEmailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        teamEmail: teamEmailData, 
        customerEmail: customerEmailData 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-demo-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
