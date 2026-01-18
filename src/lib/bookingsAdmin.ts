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
  driverName?: string; // optional for now
  adminNotes?: string;
}): Promise<void> {
  const driver =
    params.driverName?.trim() ? params.driverName.trim() : "to_be_assigned";

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed" satisfies BookingStatus,
      driver,
      admin_notes: params.adminNotes?.trim() ? params.adminNotes.trim() : null,
      confirmed_at: new Date().toISOString(),
      rejected_at: null,
    })
    .eq("id", params.id);

  if (error) throw error;
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
    })
    .eq("id", params.id);

  if (error) throw error;
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
