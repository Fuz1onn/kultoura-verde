// src/types/booking.ts
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type TransportOption = "jeepney" | "tricycle" | "van";

export type TourAddOns = {
  placesToEat: boolean;
  pasalubongCenter: boolean;
};

export type Booking = {
  id: string;
  createdAt: string; // ISO
  status: BookingStatus;

  serviceId: string;
  serviceName: string;

  instructorId: string;
  instructorName: string;

  dateISO: string; // YYYY-MM-DD
  timeLabel: string;

  transport: TransportOption;
  pickupNotes?: string;

  driver: "to_be_assigned" | string; // placeholder for later
  addOns?: TourAddOns; // optional if you later add add-ons back
};
