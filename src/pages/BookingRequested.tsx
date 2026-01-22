// src/pages/BookingRequested.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Booking, BookingStatus, TransportOption } from "@/types/booking";
import { getBookingById } from "@/lib/bookings";

type LocationState = { booking?: Booking };

function formatDate(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function transportLabel(t?: TransportOption) {
  if (!t) return "None";
  if (t === "jeepney") return "Jeepney";
  if (t === "tricycle") return "Tricycle";
  return "Van";
}

function statusPill(status: BookingStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        cls: "bg-yellow-100 text-yellow-800",
        message: (
          <>
            Your booking is{" "}
            <span className="font-medium text-gray-900">
              Pending confirmation
            </span>
            . We’ll notify you once availability is confirmed.
          </>
        ),
      };
    case "confirmed":
      return {
        label: "Confirmed",
        cls: "bg-green-100 text-green-800",
        message: (
          <>
            Your booking is{" "}
            <span className="font-medium text-gray-900">Confirmed</span>. See
            details below.
          </>
        ),
      };
    case "rejected":
      return {
        label: "Rejected",
        cls: "bg-red-100 text-red-800",
        message: (
          <>
            Your booking was{" "}
            <span className="font-medium text-gray-900">Rejected</span>. You can
            book another service anytime.
          </>
        ),
      };
    case "cancelled":
      return {
        label: "Cancelled",
        cls: "bg-gray-100 text-gray-800",
        message: (
          <>
            This booking was{" "}
            <span className="font-medium text-gray-900">Cancelled</span>.
          </>
        ),
      };
    case "completed":
      return {
        label: "Completed",
        cls: "bg-blue-100 text-blue-800",
        message: (
          <>
            This booking is{" "}
            <span className="font-medium text-gray-900">Completed</span>. Thanks
            for visiting!
          </>
        ),
      };
  }
}

export default function BookingRequested() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const location = useLocation();

  const bookingFromState = (location.state as LocationState | null)?.booking;

  const [booking, setBooking] = useState<Booking | null>(() => {
    if (bookingFromState && bookingId && bookingFromState.id === bookingId) {
      return bookingFromState;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => !booking);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const fetchBooking = async () => {
      if (!bookingId) return;

      // If navigation state already has the booking, use it once immediately
      if (bookingFromState?.id === bookingId && !booking) {
        setBooking(bookingFromState);
        setLoading(false);
      }

      try {
        setErrorMsg("");
        setLoading(true);
        const b = await getBookingById(bookingId);

        if (!alive) return;

        setBooking((prev) => {
          // avoid useless re-renders if nothing changed
          if (!prev) return b;
          if (
            prev.status === b.status &&
            prev.driver === b.driver &&
            prev.adminNotes === b.adminNotes
          ) {
            return prev;
          }
          return b;
        });
      } catch (err: unknown) {
        if (!alive) return;
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to load booking.",
        );
        setBooking(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    const startPollingIfNeeded = (b: Booking | null) => {
      // Poll only when it matters
      const shouldPoll = b?.status === "pending" || b?.status === "confirmed";

      if (!shouldPoll) {
        if (intervalId) window.clearInterval(intervalId);
        intervalId = null;
        return;
      }

      if (!intervalId) {
        intervalId = window.setInterval(() => {
          fetchBooking();
        }, 6000); // every 6s (safe + light)
      }
    };

    // initial fetch
    fetchBooking().then(() => startPollingIfNeeded(booking));

    // whenever booking changes, decide polling state
    // (this is okay because state updates trigger effect cleanup/re-run)
    // but to keep minimal, we’ll just watch booking.status via a second effect below.

    return () => {
      alive = false;
      if (intervalId) window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, bookingFromState]);

  const addOns = useMemo(() => {
    if (!booking) return null;

    const items = [
      booking.placesToEatStopId ? "Places to Eat" : null,
      booking.pasalubongStopId ? "Pasalubong Center" : null,
    ].filter(Boolean) as string[];

    return items.length ? items.join(", ") : null;
  }, [booking?.placesToEatStopId, booking?.pasalubongStopId]);

  if (!bookingId) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <h1 className="text-2xl font-semibold">Booking request not found</h1>
          <p className="mt-2 text-gray-600">
            Please return to Services and submit a booking request again.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/services")}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Back to Services
            </Button>
            <Button variant="outline" onClick={() => navigate("/bookings")}>
              View My Bookings
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="rounded-2xl bg-white border p-6 md:p-10">
            <div className="h-7 w-44 rounded bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded bg-gray-200 animate-pulse" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-16 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <h1 className="text-2xl font-semibold">Booking request not found</h1>
          <p className="mt-2 text-gray-600">
            {errorMsg ||
              "Please return to Services and submit a booking request again."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/services")}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Back to Services
            </Button>
            <Button variant="outline" onClick={() => navigate("/bookings")}>
              View My Bookings
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const pill = statusPill(booking.status);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="rounded-2xl bg-white border p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {booking.status === "pending"
                  ? "Request sent ✅"
                  : booking.status === "confirmed"
                    ? "Booking confirmed ✅"
                    : booking.status === "rejected"
                      ? "Booking update"
                      : booking.status === "completed"
                        ? "Booking completed ✅"
                        : "Booking update"}
              </h1>
              <p className="mt-2 text-gray-600">{pill.message}</p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${pill.cls}`}
            >
              {pill.label}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Service</p>
              <p className="font-medium text-gray-900">{booking.serviceName}</p>
            </div>

            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Instructor</p>
              <p className="font-medium text-gray-900">
                {booking.instructorName}
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Schedule</p>
              <p className="font-medium text-gray-900">
                {formatDate(booking.dateISO)} • {booking.timeLabel}
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Transportation</p>
              <p className="font-medium text-gray-900">
                {transportLabel(booking.transport)}
              </p>

              {booking.transport ? (
                <p className="mt-1 text-xs text-gray-500">
                  Driver:{" "}
                  <span className="font-medium text-gray-700">
                    {booking.driver && booking.driver !== "to_be_assigned"
                      ? booking.driver
                      : "To be assigned"}
                  </span>
                </p>
              ) : null}
            </div>

            {addOns ? (
              <div className="rounded-xl border bg-gray-50 px-4 py-3 md:col-span-2">
                <p className="text-xs text-gray-500">Tour Add-ons</p>
                <p className="font-medium text-gray-900">{addOns}</p>
              </div>
            ) : null}
          </div>

          {booking.pickupNotes ? (
            <div className="mt-6 rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Pickup Notes</p>
              <p className="text-sm text-gray-800">{booking.pickupNotes}</p>
            </div>
          ) : null}

          {booking.adminNotes ? (
            <div className="mt-6 rounded-xl border bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Admin Notes</p>
              <p className="text-sm text-gray-800">{booking.adminNotes}</p>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/bookings")}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate("/services")}>
              Book Another Service
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Reference ID: <span className="font-mono">{booking.id}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
