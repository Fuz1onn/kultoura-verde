// src/pages/Booking.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { addBooking } from "@/lib/bookingsStore";
import type { Booking as BookingType, TransportOption } from "@/types/booking";

const serviceMap: Record<string, string> = {
  pottery: "Pottery Making",
  cuisine: "Local Cuisine Making",
  weaving: "Weaving",
  farming: "Farming",
};

const instructorNameMap: Record<string, string> = {
  "maria-santos": "Maria Santos",
  "jon-reyes": "Jon Reyes",
  "luna-cruz": "Luna Cruz",
  "ka-nilo": "Ka Nilo",
  "ana-delosreyes": "Ana D.",
  "paolo-vergara": "Paolo Vergara",
  "althea-ramirez": "Althea Ramirez",
  "tomas-bautista": "Tomas Bautista",
  "mina-uy": "Mina Uy",
  "chef-elia": "Chef Elia",
  "tita-nene": "Tita Nene",
  "marco-sy": "Marco Sy",
};

const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

export default function Booking() {
  const navigate = useNavigate();
  const { serviceId, instructorId } = useParams();

  const serviceName = serviceMap[serviceId ?? ""];
  const instructorName = instructorNameMap[instructorId ?? ""];

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);

  // Transportation (required selection)
  const [transport, setTransport] = useState<TransportOption | null>(null);
  const [pickupNotes, setPickupNotes] = useState<string>("");

  const isValid = useMemo(
    () => Boolean(serviceName && instructorName),
    [serviceName, instructorName],
  );

  if (!isValid) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8 text-center">
          <h1 className="text-2xl font-semibold">Booking link is invalid</h1>
          <p className="mt-2 text-gray-600">
            Please choose a service and instructor again.
          </p>
          <Button className="mt-6" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </section>
    );
  }

  const transportLabel =
    transport === "jeepney"
      ? "Jeepney"
      : transport === "tricycle"
        ? "Tricycle"
        : transport === "van"
          ? "Van"
          : "";

  const canSubmit = Boolean(date && time && transport);

  return (
    <section className="relative min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <button
          onClick={() => navigate(`/services/${serviceId}/instructors`)}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back to Instructors
        </button>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Book your session
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          <span className="font-medium text-gray-900">{serviceName}</span> with{" "}
          <span className="font-medium text-gray-900">{instructorName}</span>
        </p>

        {/* Placeholder summary line */}
        <div className="mb-8 rounded-xl border bg-white px-4 py-3 text-sm text-gray-700">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              <span className="text-gray-500">Driver:</span>{" "}
              <span className="font-medium text-gray-900">To be assigned</span>
            </span>
            <span>
              <span className="text-gray-500">Vehicle:</span>{" "}
              <span className="font-medium text-gray-900">
                {transportLabel || "Select below"}
              </span>
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Step 1 of 2 — Choose your preferred date, time, and transportation.
        </p>

        <div className="rounded-2xl bg-white border p-6 md:p-8">
          {/* Date */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-4">1. Select a Date</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) setDate(d); // prevents clearing selection
              }}
              disabled={(d) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const check = new Date(d);
                check.setHours(0, 0, 0, 0);
                return check < today;
              }}
              className="rounded-xl border p-4"
            />
          </div>

          {/* Time */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-4">2. Select a Time</h2>
            <div className="flex flex-wrap gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`
                    px-4 py-2 rounded-lg border text-sm transition
                    ${
                      time === slot
                        ? "bg-green-600 text-white border-green-600"
                        : "hover:border-green-600 hover:bg-gray-50"
                    }
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Transportation (Included + required) */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-2">
              Transportation (Included)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Transportation is included in your package. Please choose your
              preferred vehicle type.{" "}
              <span className="font-medium text-gray-900">
                Driver will be assigned after confirmation.
              </span>
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "jeepney", label: "Jeepney" },
                { id: "tricycle", label: "Tricycle" },
                { id: "van", label: "Van" },
              ].map((opt) => {
                const isSelected = transport === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setTransport(opt.id as TransportOption)}
                    className={`rounded-xl border px-4 py-3 text-sm transition text-left
                      ${
                        isSelected
                          ? "border-green-600 bg-green-50"
                          : "hover:border-green-600 hover:bg-gray-50"
                      }`}
                  >
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isSelected ? "Selected" : "Choose this option"}
                    </div>
                  </button>
                );
              })}
            </div>

            {!transport && (
              <p className="mt-3 text-xs text-red-600">
                Please select a transportation type to continue.
              </p>
            )}

            {/* Optional pickup notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Pickup Notes (Optional)
              </label>
              <textarea
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                placeholder="e.g., Landmark, gate number, pickup area instructions..."
                rows={3}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
              />
              <p className="mt-2 text-xs text-gray-500">
                This helps your assigned driver find you faster.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            disabled={!canSubmit}
            className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              const dateISO = date!.toISOString().slice(0, 10);

              const booking: BookingType = {
                id:
                  typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: new Date().toISOString(),
                status: "pending",
                serviceId: serviceId!,
                serviceName,
                instructorId: instructorId!,
                instructorName,
                dateISO,
                timeLabel: time!,
                transport: transport!,
                pickupNotes: pickupNotes.trim() || undefined,
                driver: "to_be_assigned",
              };

              addBooking(booking);
              navigate(`/booking/requested/${booking.id}`, {
                state: { booking },
              });
            }}
          >
            Request Booking
          </Button>

          <p className="mt-4 text-xs text-gray-500">
            Your request will be reviewed and confirmed by our team.
          </p>
        </div>
      </div>
    </section>
  );
}
