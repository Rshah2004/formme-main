import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const allowedOrigins = new Set(["https://www.formme.io", "http://localhost:8080"]);
const buildCorsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://www.formme.io",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

interface SupportRequestPayload {
  name: string;
  email: string;
  orderId?: string;
  message: string;
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
    const message = data?.message || `Email request failed (status ${res.status}).`;
    throw new Error(message);
  }

  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response("ok", { status: 200, headers: buildCorsHeaders(origin) });
  }

  try {
    const { name, email, orderId, message }: SupportRequestPayload = await req.json();
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...buildCorsHeaders(req.headers.get("origin")) },
      });
    }

    const toEmail = "formme.design@gmail.com";

    await sendResendEmail({
      from: "Formme Support <support@formme.io>",
      to: [toEmail],
      reply_to: email,
      subject: `Support request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#344C3D;">Support Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Order ID:</strong> ${orderId || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req.headers.get("origin")) },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to send" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...buildCorsHeaders(req.headers.get("origin")) },
    });
  }
};

serve(handler);
