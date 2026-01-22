// src/lib/bookingsAdmin.ts
import { supabase } from "@/lib/supabaseClient";
import type { BookingStatus } from "@/types/booking";
import { rowToBooking, type BookingRow } from "@/lib/bookingMappers";
import type { Booking } from "@/types/booking";

export type AdminBooking = Booking & {
  userId: string;
  adminNotes?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  completedAt?: string;

  // ✅ new (optional, for joining later)
  driverId?: string | null;
};

function rowToAdminBooking(row: BookingRow): AdminBooking {
  const base = rowToBooking(row);

  return {
    ...base,
    userId: row.user_id,
    adminNotes: row.admin_notes ?? undefined,
    confirmedAt: row.confirmed_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    completedAt: row.completed_at ?? undefined,

    // ✅ assumes bookings table has driver_id uuid
    driverId: (row as any).driver_id ?? null,
  };
}

export async function adminListBookings(): Promise<AdminBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => rowToAdminBooking(r as BookingRow));
}

export async function adminConfirmBooking(params: {
  id: string;
  driverId?: string; // ✅ new: selected driver uuid (optional for now)
  adminNotes?: string;
}): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed" satisfies BookingStatus,

      // ✅ new column on bookings
      driver_id: params.driverId ?? null,

      // ✅ keep your existing driver text field consistent (optional but recommended)
      // If you still have a "driver" text column used elsewhere, keep this:
      driver: params.driverId ? "assigned" : "to_be_assigned",

      admin_notes: params.adminNotes?.trim() ? params.adminNotes.trim() : null,
      confirmed_at: new Date().toISOString(),
      rejected_at: null,
    })
    .eq("id", params.id);

  if (error) throw error;

  // Fire-and-forget: email user
  supabase.functions
    .invoke("booking-status-changed", { body: { bookingId: params.id } })
    .catch(() => {});
}

export async function adminRejectBooking(params: {
  id: string;
  adminNotes?: string;
}): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "rejected" satisfies BookingStatus,
      admin_notes: params.adminNotes?.trim() ? params.adminNotes.trim() : null,
      rejected_at: new Date().toISOString(),
      confirmed_at: null,

      // ✅ clear driver assignment on reject
      driver_id: null,
      driver: "to_be_assigned",
    })
    .eq("id", params.id);

  if (error) throw error;

  supabase.functions
    .invoke("booking-status-changed", { body: { bookingId: params.id } })
    .catch(() => {});
}

export async function adminCompleteBooking(params: {
  id: string;
}): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "completed" satisfies BookingStatus,
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) throw error;
}
