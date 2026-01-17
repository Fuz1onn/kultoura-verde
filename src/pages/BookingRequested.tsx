import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Booking, TransportOption } from "@/types/booking";
import { getBooking } from "@/lib/bookingsStore";

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

function addOnsLabel(addOns?: Booking["addOns"]) {
  if (!addOns) return null;
  const items = [
    addOns.placesToEat ? "Places to Eat" : null,
    addOns.pasalubongCenter ? "Pasalubong Center" : null,
  ].filter(Boolean) as string[];

  return items.length ? items.join(", ") : null;
}

export default function BookingRequested() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const location = useLocation();

  const bookingFromState = (location.state as LocationState | null)?.booking;

  const booking = useMemo(() => {
    if (!bookingId) return null;
    if (bookingFromState?.id === bookingId) return bookingFromState;
    return getBooking(bookingId);
  }, [bookingId, bookingFromState]);

  if (!bookingId || !booking) {
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

  const addOns = addOnsLabel(booking.addOns);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="rounded-2xl bg-white border p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Request sent ✅
              </h1>
              <p className="mt-2 text-gray-600">
                Your booking is{" "}
                <span className="font-medium text-gray-900">
                  Pending confirmation
                </span>
                . We’ll notify you once availability is confirmed.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">
              Pending
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
                  Driver: To be assigned
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
