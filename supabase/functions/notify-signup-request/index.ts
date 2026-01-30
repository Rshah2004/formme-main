import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.formme.io",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


// Admin emails to notify
const ADMIN_EMAILS = ["rythemshah2004@gmail.com", "formestartup22@gmail.com"];

interface SignupRequestPayload {
  email: string;
  fullName: string;
  companyName?: string;
  role: "designer" | "manufacturer";
}

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
  return new Response("ok", {
    status: 200,
    headers: corsHeaders,
  });
}


  try {
    const { email, fullName, companyName, role }: SignupRequestPayload = await req.json();

    // Validate required fields
    if (!email || !fullName || !role) {
      throw new Error("Missing required fields: email, fullName, and role are required");
    }

    console.log(`Signup request received from ${email} as ${role}`);

    // Send notification email to admins
    const emailResponse = await sendResendEmail({
      from: "Formme <notifications@formme.io>",
      to: ADMIN_EMAILS,
      subject: `New Signup Request: ${fullName} (${role})`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #344C3D; margin-bottom: 24px;">New Signup Request</h1>
          
          <div style="background: #FAF9F6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #344C3D; font-size: 18px; margin: 0 0 16px 0;">Applicant Details</h2>
            
            <p style="margin: 8px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${companyName || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 8px 0;"><strong>Requested:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            To approve or reject this request, please log in to the admin dashboard or respond directly to the applicant.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <p style="color: #999; font-size: 12px;">
            This is an automated notification from Formme.
          </p>
        </div>
      `,
    });

    console.log("Admin notification email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Signup request submitted successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-signup-request function:", error);
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
