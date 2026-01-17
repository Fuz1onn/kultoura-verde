// src/lib/bookingsStore.ts
import type { Booking } from "@/types/booking";

const STORAGE_KEY = "kv_bookings_v1";

export function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function addBooking(newBooking: Booking) {
  const bookings = loadBookings();
  bookings.unshift(newBooking);
  saveBookings(bookings);
}

export function getBooking(id: string): Booking | null {
  const bookings = loadBookings();
  return bookings.find((b) => b.id === id) ?? null;
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  const bookings = loadBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return;
  bookings[idx] = { ...bookings[idx], ...patch };
  saveBookings(bookings);
}

export function clearBookings() {
  localStorage.removeItem(STORAGE_KEY);
}
