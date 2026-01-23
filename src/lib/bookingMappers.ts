// src/lib/bookingMappers.ts
import type { Booking, BookingStatus, TransportOption } from "@/types/booking";

export type BookingRow = {
  id: string;
  user_id: string;

  status: BookingStatus;

  service_id: string;
  service_name: string;

  instructor_id: string;
  instructor_name: string;

  date_iso: string;
  time_label: string;

  transport: TransportOption | null;
  pickup_notes: string | null;

  driver: string;
  driver_id: string | null;

  places_to_eat_stop_id: string | null;
  pasalubong_stop_id: string | null;

  // ✅ NEW: locked pricing fields
  final_workshop_rate: number | null;
  final_materials_fee: number | null;
  final_transport_rate: number | null;
  final_total: number | null;
  pricing_locked_at: string | null;

  admin_notes: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

export function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,

    serviceId: row.service_id,
    serviceName: row.service_name,

    instructorId: row.instructor_id,
    instructorName: row.instructor_name,

    dateISO: row.date_iso,
    timeLabel: row.time_label,

    transport: row.transport ?? undefined,
    pickupNotes: row.pickup_notes ?? undefined,

    driver: row.driver,
    driverId: row.driver_id ?? null,

    placesToEatStopId: row.places_to_eat_stop_id ?? undefined,
    pasalubongStopId: row.pasalubong_stop_id ?? undefined,

    // ✅ NEW: locked pricing fields
    finalWorkshopRate: row.final_workshop_rate ?? null,
    finalMaterialsFee: row.final_materials_fee ?? null,
    finalTransportRate: row.final_transport_rate ?? null,
    finalTotal: row.final_total ?? null,
    pricingLockedAt: row.pricing_locked_at ?? null,

    adminNotes: row.admin_notes ?? undefined,
  };
}

export type CreateBookingParams = {
  userId: string;

  status?: BookingStatus;

  serviceId: string;
  serviceName: string;

  instructorId: string;
  instructorName: string;

  dateISO: string;
  timeLabel: string;

  transport?: TransportOption;
  pickupNotes?: string;

  driver?: string;

  placesToEatStopId?: string | null;
  pasalubongStopId?: string | null;
};

export function bookingToInsertRow(
  params: CreateBookingParams,
): Omit<BookingRow, "id" | "created_at" | "updated_at"> {
  return {
    user_id: params.userId,

    status: params.status ?? "pending",

    service_id: params.serviceId,
    service_name: params.serviceName,

    instructor_id: params.instructorId,
    instructor_name: params.instructorName,

    date_iso: params.dateISO,
    time_label: params.timeLabel,

    transport: params.transport ?? null,
    pickup_notes: params.pickupNotes?.trim() ? params.pickupNotes.trim() : null,

    driver: params.driver ?? "to_be_assigned",
    driver_id: null,

    places_to_eat_stop_id: params.placesToEatStopId ?? null,
    pasalubong_stop_id: params.pasalubongStopId ?? null,

    // ✅ NEW: locked pricing defaults (null until admin confirms)
    final_workshop_rate: null,
    final_materials_fee: null,
    final_transport_rate: null,
    final_total: null,
    pricing_locked_at: null,

    admin_notes: null,
    confirmed_at: null,
    rejected_at: null,
    completed_at: null,
  };
}
