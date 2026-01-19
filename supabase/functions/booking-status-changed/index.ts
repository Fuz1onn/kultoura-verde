// supabase/functions/booking-status-changed/index.ts
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
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
    const SITE_URL = Deno.env.get("SITE_URL");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (
      !RESEND_API_KEY ||
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

    // Service client
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify requester is admin using JWT user + profiles table
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const requesterClient = createClient(SUPABASE_URL, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: requester },
    } = await requesterClient.auth.getUser();

    if (!requester) return json(401, { error: "Invalid token." });

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("id", requester.id)
      .single();

    if (!profile?.is_admin) return json(403, { error: "Admin only." });

    // Load booking
    const { data: booking, error: bookingErr } = await serviceClient
      .from("bookings")
      .select(
        "id,user_id,status,service_name,instructor_name,date_iso,time_label,transport,driver,admin_notes"
      )
      .eq("id", body.bookingId)
      .single();

    if (bookingErr || !booking) return json(404, { error: "Booking not found." });

    // Fetch user's email from auth
    const { data: userData, error: userErr } = await serviceClient.auth.admin.getUserById(
      booking.user_id
    );

    if (userErr || !userData?.user?.email) {
      return json(500, { error: "Could not fetch user email." });
    }

    const userEmail = userData.user.email;
    const bookingLink = `${SITE_URL}/booking/requested/${booking.id}`;

    const status = booking.status as string;
    const subjectStatus =
      status === "confirmed"
        ? "Booking confirmed"
        : status === "rejected"
          ? "Booking rejected"
          : `Booking update: ${status}`;

    const driverLine =
      booking.transport
        ? `<p><b>Driver:</b> ${
            booking.driver && booking.driver !== "to_be_assigned"
              ? booking.driver
              : "To be assigned"
          }</p>`
        : "";

    const notesLine = booking.admin_notes
      ? `<p><b>Notes:</b> ${booking.admin_notes}</p>`
      : "";

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2>${subjectStatus}</h2>
        <p><b>Service:</b> ${booking.service_name}</p>
        <p><b>Instructor:</b> ${booking.instructor_name}</p>
        <p><b>Schedule:</b> ${booking.date_iso} • ${booking.time_label}</p>
        <p><b>Status:</b> ${status}</p>
        ${booking.transport ? `<p><b>Transport:</b> ${booking.transport}</p>` : `<p><b>Transport:</b> None</p>`}
        ${driverLine}
        ${notesLine}
        <p style="margin-top:16px;">
          <a href="${bookingLink}">View booking</a>
        </p>
        <p style="color:#64748b;font-size:12px;margin-top:16px;">
          Reference ID: ${booking.id}
        </p>
      </div>
    `;

    await sendResendEmail({
      apiKey: RESEND_API_KEY,
      from: FROM_EMAIL,
      to: userEmail,
      subject: `${subjectStatus} • ${booking.service_name}`,
      html,
    });

    return json(200, { ok: true });
  } catch (err: unknown) {
    return json(500, {
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});
