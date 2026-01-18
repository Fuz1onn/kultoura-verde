// src/lib/bookings.ts
import { supabase } from "@/lib/supabaseClient";
import type { Booking, TourAddOns, TransportOption } from "@/types/booking";
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

  dateISO: string; // YYYY-MM-DD
  timeLabel: string;

  transport?: TransportOption;
  pickupNotes?: string;

  addOns?: TourAddOns;
};

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
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

    addOns: input.addOns,
  });

  const { data, error } = await supabase
    .from("bookings")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) throw error;
  return rowToBooking(data as BookingRow);
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
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r) => rowToBooking(r as BookingRow));
}

// Optional helper if you want readable errors in UI
export function supabaseErrorToString(err: unknown) {
  return errorMessage(err);
}
