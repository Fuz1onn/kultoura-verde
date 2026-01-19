// supabase/functions/booking-created/index.ts
/// <reference types="https://deno.land/x/supabase_functions@1.0.0/mod.ts" />
import { createClient } from "npm:@supabase/supabase-js@2";

type Body = { bookingId?: string };

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }
}

Deno.serve(async (req) => {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const SITE_URL = Deno.env.get("SITE_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !RESEND_API_KEY ||
      !ADMIN_EMAIL ||
      !FROM_EMAIL ||
      !SITE_URL ||
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return json(500, { error: "Missing required environment variables." });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Missing auth token." });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.bookingId) return json(400, { error: "bookingId is required." });

    // Client w/ user JWT (to identify requester)
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) return json(401, { error: "Invalid token." });

    // Service client (to fetch booking regardless of RLS if needed)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: booking, error: bookingErr } = await serviceClient
      .from("bookings")
      .select(
        "id,user_id,status,service_name,instructor_name,date_iso,time_label,transport,pickup_notes,add_ons,created_at"
      )
      .eq("id", body.bookingId)
      .single();

    if (bookingErr || !booking) return json(404, { error: "Booking not found." });

    // Prevent abuse: only booking owner can trigger this function
    if (booking.user_id !== user.id) {
      return json(403, { error: "Not allowed." });
    }

    const adminLink = `${SITE_URL}/admin/bookings`;
    const bookingLink = `${SITE_URL}/booking/requested/${booking.id}`;

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>New booking request</h2>
        <p><b>Status:</b> ${booking.status}</p>
        <p><b>Service:</b> ${booking.service_name}</p>
        <p><b>Instructor:</b> ${booking.instructor_name}</p>
        <p><b>Schedule:</b> ${booking.date_iso} • ${booking.time_label}</p>
        <p><b>Transport:</b> ${booking.transport ?? "None"}</p>
        ${booking.pickup_notes ? `<p><b>Pickup notes:</b> ${booking.pickup_notes}</p>` : ""}
        ${booking.add_ons ? `<pre style="background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:12px;">${JSON.stringify(booking.add_ons, null, 2)}</pre>` : ""}
        <p style="margin-top:16px;">
          <a href="${adminLink}">Open Admin Bookings</a>
          &nbsp;•&nbsp;
          <a href="${bookingLink}">View Booking Page</a>
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:16px;">
          Booking ID: ${booking.id}
        </p>
      </div>
    `;

    await sendResendEmail({
      apiKey: RESEND_API_KEY,
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New booking: ${booking.service_name} (${booking.date_iso} ${booking.time_label})`,
      html,
    });

    return json(200, { ok: true });
  } catch (err: unknown) {
    return json(500, {
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});
