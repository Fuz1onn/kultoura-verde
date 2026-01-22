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
