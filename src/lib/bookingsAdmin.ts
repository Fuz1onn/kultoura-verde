// src/lib/bookingsAdmin.ts
import { supabase } from "@/lib/supabaseClient";
import type { BookingStatus, TransportOption } from "@/types/booking";
import { rowToBooking, type BookingRow } from "@/lib/bookingMappers";
import type { Booking } from "@/types/booking";

export type AdminBooking = Booking & {
  userId: string;
  adminNotes?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
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
    driverId: row.driver_id ?? null,
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

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickFinalWorkshopRate(i: {
  rate: number | null;
  rate_min: number | null;
}): number {
  return num(i.rate ?? i.rate_min ?? 0);
}

function pickFinalMaterialsFee(i: {
  materials_fee_min: number | null;
}): number {
  return num(i.materials_fee_min ?? 0);
}

export async function adminConfirmBooking(params: {
  id: string;
  driverId?: string; // selected driver uuid (optional)
  adminNotes?: string;
}): Promise<void> {
  // 1) Fetch booking to get instructor_id (required for pricing lock)
  const { data: bookingRow, error: bErr } = await supabase
    .from("bookings")
    .select("id, instructor_id")
    .eq("id", params.id)
    .single();

  if (bErr) throw bErr;
  if (!bookingRow) throw new Error("Booking not found.");
  if (!bookingRow.instructor_id)
    throw new Error("Booking has no instructor_id.");

  // 2) Fetch instructor pricing
  const { data: instructor, error: iErr } = await supabase
    .from("instructors")
    .select("rate, rate_min, materials_fee_min")
    .eq("id", bookingRow.instructor_id)
    .single();

  if (iErr) throw iErr;
  if (!instructor) throw new Error("Instructor not found.");

  const finalWorkshopRate = pickFinalWorkshopRate(instructor);
  const finalMaterialsFee = pickFinalMaterialsFee(instructor);

  // 3) If driver selected, fetch driver rate
  let finalTransportRate = 0;

  if (params.driverId) {
    const { data: driver, error: dErr } = await supabase
      .from("drivers")
      .select("rate, vehicle_type")
      .eq("id", params.driverId)
      .single();

    if (dErr) throw dErr;
    if (!driver) throw new Error("Driver not found.");

    finalTransportRate = num(driver.rate);
  }

  const finalTotal = finalWorkshopRate + finalMaterialsFee + finalTransportRate;

  // 4) Confirm + lock pricing + assign driver_id
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed" satisfies BookingStatus,

      driver_id: params.driverId ?? null,
      driver: params.driverId ? "assigned" : "to_be_assigned",

      admin_notes: params.adminNotes?.trim() ? params.adminNotes.trim() : null,
      confirmed_at: new Date().toISOString(),
      rejected_at: null,

      // ✅ lock pricing here
      final_workshop_rate: finalWorkshopRate,
      final_materials_fee: finalMaterialsFee,
      final_transport_rate: finalTransportRate,
      final_total: finalTotal,
      pricing_locked_at: new Date().toISOString(),
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

      // clear driver assignment on reject
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
