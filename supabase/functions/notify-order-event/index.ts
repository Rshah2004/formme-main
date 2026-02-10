import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EventPayload = {
  event_type:
    | "message_created"
    | "order_status_changed"
    | "order_update_created"
    | "sample_submitted"
    | "qc_submitted"
    | "shipping_confirmed"
    | "sample_reviewed"
    | "qc_reviewed"
    | "designer_feedback";
  message_id?: string;
  order_id?: string;
  sender_id?: string;
  old_status?: string | null;
  new_status?: string | null;
  update_id?: string;
  update_status?: string | null;
  update_message?: string | null;
  sample_approved?: boolean | null;
  qc_approved?: boolean | null;
  feedback_type?: string | null;
  feedback_message?: string | null;
};

const sendResendEmail = async (payload: Record<string, unknown>) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY env var");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || `Email request failed (status ${res.status}).`;
    throw new Error(message);
  }

  return data;
};

const getWebhookSecret = () => Deno.env.get("NOTIFY_WEBHOOK_SECRET");
const getFromEmail = () =>
  Deno.env.get("NOTIFY_FROM_EMAIL") ?? "Formme Notifications <notifications@formme.com>";
const getAppUrl = () => Deno.env.get("APP_URL") ?? "https://formme.com";

const shouldSendEmail = (pref: any, category: "message" | "order" | "shipping") => {
  if (!pref) return true;
  const channels = Array.isArray(pref.channels) ? pref.channels : [];
  if (!channels.includes("email")) return false;

  if (category === "message") return pref.manufacturer_responses !== false;
  if (category === "shipping") return pref.shipping_updates !== false;
  return pref.order_updates !== false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const secret = getWebhookSecret();
    const requestSecret = req.headers.get("x-webhook-secret");
    if (secret && secret !== requestSecret) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const payload: EventPayload = await req.json();
    if (!payload?.event_type) {
      throw new Error("Missing event_type in payload");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const fromEmail = getFromEmail();
    const appUrl = getAppUrl();

    const getUserEmail = async (userId: string) => {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error || !data?.user?.email) return null;
      return data.user.email;
    };

    const getPreferences = async (userId: string) => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("channels, order_updates, manufacturer_responses, shipping_updates")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    };

    const getOrder = async (orderId: string) => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, design_id, status, designer_id, manufacturer_id, designs(name), manufacturers(name, user_id)")
        .eq("id", orderId)
        .maybeSingle();
      if (error || !data) return null;
      return data;
    };

    const sendUserEmail = async (
      userId: string,
      subject: string,
      html: string,
      category: "message" | "order" | "shipping"
    ) => {
      const pref = await getPreferences(userId);
      if (!shouldSendEmail(pref, category)) return { skipped: true };
      const email = await getUserEmail(userId);
      if (!email) return { skipped: true };
      await sendResendEmail({
        from: fromEmail,
        to: [email],
        subject,
        html,
      });
      return { success: true };
    };

    if (payload.event_type === "message_created") {
      if (!payload.message_id) throw new Error("Missing message_id for message event");

      const { data: message, error: messageError } = await supabase
        .from("messages")
        .select("id, content, sender_id, order_id, created_at")
        .eq("id", payload.message_id)
        .maybeSingle();

      if (messageError || !message) throw new Error("Message not found");

      const order = await getOrder(message.order_id);
      if (!order) throw new Error("Order not found for message");

      let recipientUserId: string | null = null;
      let recipientName: string | null = null;

      if (message.sender_id === order.designer_id) {
        recipientUserId = order.manufacturers?.user_id ?? null;
        recipientName = order.manufacturers?.name ?? "Manufacturer";
      } else {
        recipientUserId = order.designer_id;
        recipientName = order.designs?.name ?? "Designer";
      }

      if (!recipientUserId) {
        return new Response(JSON.stringify({ skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const designName = order.designs?.name ?? "Your order";
      const messageSnippet = message.content?.slice(0, 140) ?? "";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;

      await sendUserEmail(
        recipientUserId,
        `New message on ${designName}`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>Hi ${recipientName},</p>
            <p>You received a new message on <strong>${designName}</strong>.</p>
            <blockquote style="margin: 12px 0; padding-left: 12px; border-left: 3px solid #ddd; color: #555;">
              ${messageSnippet}
            </blockquote>
            <p><a href="${orderLink}">Open the conversation</a></p>
          </div>
        `,
        "message"
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.event_type === "order_status_changed") {
      if (!payload.order_id) throw new Error("Missing order_id for order event");

      const order = await getOrder(payload.order_id);
      if (!order) throw new Error("Order not found");

      const designName = order.designs?.name ?? "Your order";
      const manufacturerName = order.manufacturers?.name ?? "Manufacturer";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;
      const newStatus = payload.new_status ?? order.status ?? "";

      if (newStatus === "sent_to_manufacturer") {
        if (order.manufacturers?.user_id) {
          await sendUserEmail(
            order.manufacturers.user_id,
            `New request: ${designName}`,
            `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <p>You received a new request for <strong>${designName}</strong>.</p>
                <p><a href="${orderLink}">Open the order</a></p>
              </div>
            `,
            "order"
          );
        }
      } else if (newStatus === "manufacturer_review") {
        await sendUserEmail(
          order.designer_id,
          `Manufacturer connected for ${designName}`,
          `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <p><strong>${manufacturerName}</strong> is now reviewing your order for <strong>${designName}</strong>.</p>
              <p><a href="${orderLink}">View order</a></p>
            </div>
          `,
          "order"
        );
      } else if (newStatus === "production_approval") {
        if (order.manufacturers?.user_id) {
          await sendUserEmail(
            order.manufacturers.user_id,
            `Contract finalized for ${designName}`,
            `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <p>The designer finalized the contract for <strong>${designName}</strong>.</p>
                <p><a href="${orderLink}">View order</a></p>
              </div>
            `,
            "order"
          );
        }
      } else if (newStatus === "shipping" || newStatus === "delivered") {
        await sendUserEmail(
          order.designer_id,
          `Order update: ${designName} is now ${newStatus}`,
          `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <p>Your order <strong>${designName}</strong> with <strong>${manufacturerName}</strong> has been updated.</p>
              <p>Status: <strong>${newStatus}</strong></p>
              <p><a href="${orderLink}">View order details</a></p>
            </div>
          `,
          "shipping"
        );
      } else if (newStatus === "quality_check") {
        if (order.manufacturers?.user_id) {
          await sendUserEmail(
            order.manufacturers.user_id,
            `Sample approved for ${designName}`,
            `
              <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <p>The designer approved the sample for <strong>${designName}</strong>.</p>
                <p><a href="${orderLink}">View order</a></p>
              </div>
            `,
            "order"
          );
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      payload.event_type === "sample_submitted" ||
      payload.event_type === "qc_submitted" ||
      payload.event_type === "shipping_confirmed"
    ) {
      if (!payload.order_id) throw new Error("Missing order_id for event");
      const order = await getOrder(payload.order_id);
      if (!order) throw new Error("Order not found");

      const designName = order.designs?.name ?? "Your order";
      const manufacturerName = order.manufacturers?.name ?? "Manufacturer";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;

      let subject = `Update for ${designName}`;
      let body = "There is a new update on your order.";

      if (payload.event_type === "sample_submitted") {
        subject = `Sample submitted for ${designName}`;
        body = `${manufacturerName} submitted sample photos/notes for your review.`;
      } else if (payload.event_type === "qc_submitted") {
        subject = `QC submitted for ${designName}`;
        body = `${manufacturerName} submitted QC results for your review.`;
      } else if (payload.event_type === "shipping_confirmed") {
        subject = `Shipping confirmed for ${designName}`;
        body = `${manufacturerName} confirmed shipping details.`;
      }

      await sendUserEmail(
        order.designer_id,
        subject,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>${body}</p>
            <p><a href="${orderLink}">View order</a></p>
          </div>
        `,
        payload.event_type === "shipping_confirmed" ? "shipping" : "order"
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.event_type === "sample_reviewed" || payload.event_type === "qc_reviewed") {
      if (!payload.order_id) throw new Error("Missing order_id for event");
      const order = await getOrder(payload.order_id);
      if (!order) throw new Error("Order not found");
      if (!order.manufacturers?.user_id) {
        return new Response(JSON.stringify({ skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const designName = order.designs?.name ?? "Your order";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;

      let subject = `Update for ${designName}`;
      let body = "The designer updated their review.";
      if (payload.event_type === "sample_reviewed") {
        subject = payload.sample_approved
          ? `Sample approved for ${designName}`
          : `Sample feedback for ${designName}`;
        body = payload.sample_approved
          ? "The designer approved the sample."
          : "The designer requested changes to the sample.";
      } else if (payload.event_type === "qc_reviewed") {
        subject = payload.qc_approved
          ? `QC approved for ${designName}`
          : `QC feedback for ${designName}`;
        body = payload.qc_approved
          ? "The designer approved QC."
          : "The designer rejected QC and requested changes.";
      }

      await sendUserEmail(
        order.manufacturers.user_id,
        subject,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>${body}</p>
            <p><a href="${orderLink}">View order</a></p>
          </div>
        `,
        "order"
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.event_type === "designer_feedback") {
      if (!payload.order_id) throw new Error("Missing order_id for event");
      const order = await getOrder(payload.order_id);
      if (!order) throw new Error("Order not found");
      if (!order.manufacturers?.user_id) {
        return new Response(JSON.stringify({ skipped: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const designName = order.designs?.name ?? "Your order";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;
      const feedbackType = payload.feedback_type ?? "feedback";
      const feedbackMessage = payload.feedback_message ?? "";

      await sendUserEmail(
        order.manufacturers.user_id,
        `Designer feedback for ${designName}`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>The designer sent feedback (${feedbackType}) for <strong>${designName}</strong>.</p>
            <p>${feedbackMessage}</p>
            <p><a href="${orderLink}">View order</a></p>
          </div>
        `,
        "order"
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (payload.event_type === "order_update_created") {
      if (!payload.order_id) throw new Error("Missing order_id for update event");

      const order = await getOrder(payload.order_id);
      if (!order) throw new Error("Order not found");

      const designName = order.designs?.name ?? "Your order";
      const orderLink = `${appUrl}/workflow?designId=${order.design_id ?? ""}`;

      await sendUserEmail(
        order.designer_id,
        `New update for ${designName}`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>There is a new update for <strong>${designName}</strong>.</p>
            <p>Status: <strong>${payload.update_status ?? "updated"}</strong></p>
            <p>${payload.update_message ?? ""}</p>
            <p><a href="${orderLink}">View order details</a></p>
          </div>
        `,
        "order"
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
