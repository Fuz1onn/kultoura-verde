// src/types/booking.ts
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

export type TransportOption = "jeepney" | "tricycle" | "van";

export type Booking = {
  id: string;
  createdAt: string;
  status: BookingStatus;

  serviceId: string;
  serviceName: string;

  instructorId: string;
  instructorName: string;

  dateISO: string;
  timeLabel: string;

  transport?: TransportOption;
  pickupNotes?: string;

  driver: "to_be_assigned" | "not_included" | string;

  // ✅ ADD THIS
  driverId?: string | null;

  placesToEatStopId?: string | null;
  pasalubongStopId?: string | null;

  adminNotes?: string;
};
