// src/lib/bookings.ts
import { supabase } from "@/lib/supabaseClient";
import type { Booking, TransportOption } from "@/types/booking";
import {
  bookingToInsertRow,
  rowToBooking,
  type BookingRow,
} from "@/lib/bookingMappers";

type CreateBookingInput = {
  serviceId: string;
  serviceName: string;

  instructorId: string;
  instructorName: string;

  dateISO: string;
  timeLabel: string;

  transport?: TransportOption;
  pickupNotes?: string;

  // ✅ NEW (real data)
  placesToEatStopId?: string | null;
  pasalubongStopId?: string | null;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!authData.user) throw new Error("Not authenticated.");

  const insertRow = bookingToInsertRow({
    userId: authData.user.id,

    serviceId: input.serviceId,
    serviceName: input.serviceName,

    instructorId: input.instructorId,
    instructorName: input.instructorName,

    dateISO: input.dateISO,
    timeLabel: input.timeLabel,

    transport: input.transport,
    pickupNotes: input.pickupNotes,

    placesToEatStopId: input.placesToEatStopId,
    pasalubongStopId: input.pasalubongStopId,
  });

  const { data, error } = await supabase
    .from("bookings")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) throw error;

  const booking = rowToBooking(data as BookingRow);

  // Fire-and-forget: admin email (don’t block booking UX if email fails)
  supabase.functions
    .invoke("booking-created", { body: { bookingId: booking.id } })
    .catch(() => {});

  return booking;
}

export async function getBookingById(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return rowToBooking(data as BookingRow);
}

export async function listMyBookings(): Promise<Booking[]> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!authData.user) throw new Error("Not authenticated.");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((r) => rowToBooking(r as BookingRow));
}

export async function cancelMyBooking(bookingId: string): Promise<void> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!authData.user) throw new Error("Not authenticated.");

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", authData.user.id);

  if (error) throw error;
}

// Optional helper if you want readable errors in UI
export function supabaseErrorToString(err: unknown) {
  return errorMessage(err);
}

// -------------------------------
// Admin: lock pricing on confirm / driver assignment
// -------------------------------
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Choose a single "final" value from instructor pricing columns
function pickFinalWorkshopRate(i: {
  rate: number | null;
  rate_min: number | null;
  rate_max: number | null;
}): number {
  // Prefer exact rate, else min, else 0
  return num(i.rate ?? i.rate_min ?? 0);
}

function pickFinalMaterialsFee(i: {
  materials_fee_min: number | null;
  materials_fee_max: number | null;
}): number {
  // Prefer min as default; change to max if you want higher estimate
  return num(i.materials_fee_min ?? 0);
}

/**
 * Admin confirms booking AND locks instructor pricing
 * (and transport too if driver already assigned).
 */
export async function adminConfirmBookingLockPricing(
  bookingId: string,
): Promise<void> {
  // 1) Get booking FKs
  const { data: bookingRow, error: bErr } = await supabase
    .from("bookings")
    .select("id, instructor_id, driver_id")
    .eq("id", bookingId)
    .single();

  if (bErr) throw bErr;
  if (!bookingRow) throw new Error("Booking not found.");
  if (!bookingRow.instructor_id)
    throw new Error("Booking has no instructor_id.");

  // 2) Instructor pricing
  const { data: instructor, error: iErr } = await supabase
    .from("instructors")
    .select("rate, rate_min, rate_max, materials_fee_min, materials_fee_max")
    .eq("id", bookingRow.instructor_id)
    .single();

  if (iErr) throw iErr;
  if (!instructor) throw new Error("Instructor not found.");

  const finalWorkshopRate = pickFinalWorkshopRate(instructor);
  const finalMaterialsFee = pickFinalMaterialsFee(instructor);

  // 3) Transport (if already assigned)
  let finalTransportRate = 0;

  if (bookingRow.driver_id) {
    const { data: driver, error: dErr } = await supabase
      .from("drivers")
      .select("rate")
      .eq("id", bookingRow.driver_id)
      .single();

    // don't block confirmation if driver missing
    if (!dErr && driver) finalTransportRate = num(driver.rate);
  }

  const finalTotal = finalWorkshopRate + finalMaterialsFee + finalTransportRate;

  // 4) Confirm + lock
  const { error: updErr } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      final_workshop_rate: finalWorkshopRate,
      final_materials_fee: finalMaterialsFee,
      final_transport_rate: finalTransportRate,
      final_total: finalTotal,
      pricing_locked_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updErr) throw updErr;
}

/**
 * Admin assigns driver and locks transport pricing.
 * Also recomputes final_total using already-locked workshop/materials.
 */
export async function adminAssignDriverLockTransport(
  bookingId: string,
  driverId: string,
): Promise<void> {
  // 1) Driver rate
  const { data: driver, error: dErr } = await supabase
    .from("drivers")
    .select("rate")
    .eq("id", driverId)
    .single();

  if (dErr) throw dErr;
  if (!driver) throw new Error("Driver not found.");

  const finalTransportRate = num(driver.rate);

  // 2) Existing locked workshop/materials
  const { data: bookingRow, error: bErr } = await supabase
    .from("bookings")
    .select("final_workshop_rate, final_materials_fee")
    .eq("id", bookingId)
    .single();

  if (bErr) throw bErr;
  if (!bookingRow) throw new Error("Booking not found.");

  const workshop = num(bookingRow.final_workshop_rate);
  const materials = num(bookingRow.final_materials_fee);
  const finalTotal = workshop + materials + finalTransportRate;

  // 3) Update booking
  const { error: updErr } = await supabase
    .from("bookings")
    .update({
      driver_id: driverId,
      final_transport_rate: finalTransportRate,
      final_total: finalTotal,
      pricing_locked_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updErr) throw updErr;
}
