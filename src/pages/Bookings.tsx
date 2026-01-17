import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@/types/booking";
import { clearBookings, loadBookings } from "@/lib/bookingsStore";

function statusBadge(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
  }
}

function formatDate(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(() => loadBookings());

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-sm text-gray-600 hover:text-green-700"
        >
          ← Back to Home
        </button>

        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-semibold">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              Track your booking requests and confirmations.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/services")}>
              Browse Services
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearBookings();
                setBookings([]);
              }}
            >
              Clear (Dev)
            </Button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No bookings yet</h2>
            <p className="mt-2 text-gray-600">
              Start by choosing a service and instructor.
            </p>
            <Button
              className="mt-6 bg-green-600 text-white hover:bg-green-700"
              onClick={() => navigate("/services")}
            >
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white border p-6">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{b.serviceName}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      Instructor:{" "}
                      <span className="font-medium text-gray-900">
                        {b.instructorName}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Schedule:{" "}
                      <span className="font-medium text-gray-900">
                        {formatDate(b.dateISO)} • {b.timeLabel}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Transport:{" "}
                      <span className="font-medium text-gray-900">
                        {b.transport}
                      </span>{" "}
                      <span className="text-gray-500">
                        (Driver: To be assigned)
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/booking/requested/${b.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>

                {b.pickupNotes && (
                  <div className="mt-4 rounded-xl bg-gray-50 border px-4 py-3">
                    <p className="text-xs text-gray-500">Pickup Notes</p>
                    <p className="text-sm text-gray-800">{b.pickupNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
