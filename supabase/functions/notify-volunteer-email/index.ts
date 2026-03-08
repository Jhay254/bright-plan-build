import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id, approved, rejection_reason } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user email from auth.users via service role
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user_id}`, {
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
      },
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Failed to fetch user:", errText);
      return new Response(JSON.stringify({ error: "Failed to fetch user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userData = await userRes.json();
    const email = userData.email;

    if (!email) {
      console.log("No email found for user, skipping notification");
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build email content
    const subject = approved
      ? "🌿 You're approved — Welcome to Echo!"
      : "Echo Volunteer Application Update";

    const html = approved
      ? `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2D6A4F; font-size: 22px; margin: 0;">You're approved! 🌿</h1>
          </div>
          <p style="color: #2C2825; font-size: 15px; line-height: 1.6;">
            Your volunteer application has been reviewed and <strong style="color: #2D6A4F;">approved</strong>.
            You can now sign in to Echo and start accepting support sessions.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://bright-plan-build.lovable.app/app/volunteer"
               style="display: inline-block; padding: 12px 28px; background: #2D6A4F; color: #FAFAF8; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Open Volunteer Hub
            </a>
          </div>
          <p style="color: #6B6560; font-size: 13px; line-height: 1.5;">
            Thank you for choosing to support others on their healing journey.
          </p>
          <hr style="border: none; border-top: 1px solid #E8E0D8; margin: 24px 0;" />
          <p style="color: #6B6560; font-size: 11px; text-align: center;">Echo — You are not alone</p>
        </div>
      `
      : `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2C2825; font-size: 22px; margin: 0;">Application Update</h1>
          </div>
          <p style="color: #2C2825; font-size: 15px; line-height: 1.6;">
            Thank you for your interest in volunteering with Echo. After careful review, your application was not approved at this time.
          </p>
          ${rejection_reason ? `
          <div style="background: #F2EDE8; border-left: 3px solid #D4551A; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="color: #6B6560; font-size: 12px; font-weight: 600; margin: 0 0 4px;">Reason</p>
            <p style="color: #2C2825; font-size: 14px; margin: 0;">${rejection_reason}</p>
          </div>` : ""}
          <p style="color: #2C2825; font-size: 15px; line-height: 1.6;">
            You're welcome to update your application and re-apply. Sign in to review the feedback and resubmit.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="https://bright-plan-build.lovable.app/app/volunteer"
               style="display: inline-block; padding: 12px 28px; background: #2D6A4F; color: #FAFAF8; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Review & Re-apply
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #E8E0D8; margin: 24px 0;" />
          <p style="color: #6B6560; font-size: 11px; text-align: center;">Echo — You are not alone</p>
        </div>
      `;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Echo <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", JSON.stringify(resendData));
      return new Response(JSON.stringify({ error: "Email send failed", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Email sent successfully:", resendData.id);
    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
