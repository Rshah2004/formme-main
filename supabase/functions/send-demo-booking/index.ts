import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DemoBookingRequest {
  name: string;
  email: string;
  date: string;
  time: string;
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

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    // Normalize resend errors into a throw so callers can handle per-email.
    const message = data?.message || `Email request failed (status ${res.status}).`;
    const err = new Error(message);
    (err as any).status = res.status;
    (err as any).provider = data;
    throw err;
  }

  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, date, time }: DemoBookingRequest = await req.json();

    if (!name || !email || !date || !time) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Received demo booking request:", { name, email, date, time });

    const FROM_EMAIL = "Formme <demo@formme.io>";

    // 1) Team email (Formme team)
    // NOTE: Some email providers restrict test-mode sending to only the account owner's email.
    // We attempt both recipients; if restricted, we still send the customer confirmation.
    let teamEmail: any = null;
    let teamEmailError: any = null;
    try {
      teamEmail = await sendResendEmail({
        from: FROM_EMAIL,
        to: ["formestartup22@gmail.com", "rythemshah2004@gmail.com"],
        reply_to: email,
        subject: `${name} (${email}) wants to schedule a meeting on ${date} at ${time}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <p style="font-size:16px; line-height:1.6;">
              <strong>${name}</strong> (<strong>${email}</strong>) wants to schedule a meeting on <strong>${date}</strong> at <strong>${time}</strong>.
            </p>
          </div>
        `,
      });
      console.log("Team email sent:", teamEmail);
    } catch (err: any) {
      teamEmailError = {
        message: err?.message || "Failed to send team email",
        status: err?.status,
        provider: err?.provider,
      };
      console.log("Team email failed:", teamEmailError);
    }

    // 2) Customer confirmation email
    const customerEmail = await sendResendEmail({
      from: FROM_EMAIL,
      to: [email],
      reply_to: "formestartup22@gmail.com",
      subject: "We received your demo request — Formme",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p style="font-size:16px; line-height:1.6;">Hi ${name},</p>
          <p style="font-size:16px; line-height:1.6;">Thanks for booking a demo — the Formme platform will reach out to you shortly to confirm the details.</p>
          <p style="font-size:16px; line-height:1.6;">Requested: <strong>${date}</strong> at <strong>${time}</strong></p>
          <p style="font-size:16px; line-height:1.6;">— FormMe Team</p>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmail);

    return new Response(
      JSON.stringify({
        success: true,
        teamEmail,
        teamEmailError,
        customerEmail,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error: any) {
    console.error("Error in send-demo-booking function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
