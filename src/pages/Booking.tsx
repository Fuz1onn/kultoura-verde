// src/pages/Booking.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import type { TransportOption } from "@/types/booking";
import { createBooking } from "@/lib/bookings";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { listTourStops, type TourStop } from "@/lib/tourStops";

const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

type ServiceRow = {
  id: string;
  slug: string;
  name: string;
};

type InstructorRow = {
  id: string;
  name: string;
  nickname: string | null;
};

type PickTourStopState = {
  pickTourStop?: {
    id: string;
    category: "places_to_eat" | "pasalubong_center";
  };
} | null;

export default function Booking() {
  const navigate = useNavigate();
  const { serviceId, instructorId } = useParams(); // serviceId = slug, instructorId = UUID

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [service, setService] = useState<ServiceRow | null>(null);
  const [instructor, setInstructor] = useState<InstructorRow | null>(null);

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);

  // Transportation (OPTIONAL)
  const [transport, setTransport] = useState<TransportOption | null>(null);
  const [pickupNotes, setPickupNotes] = useState<string>("");

  const [restaurants, setRestaurants] = useState<TourStop[]>([]);
  const [pasalubong, setPasalubong] = useState<TourStop[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    null,
  );
  const [selectedPasalubong, setSelectedPasalubong] = useState<string | null>(
    null,
  );

  const location = useLocation();

  useEffect(() => {
    const state = location.state as PickTourStopState;
    const pick = state?.pickTourStop;
    if (!pick) return;

    if (pick.category === "places_to_eat") {
      setSelectedRestaurant(pick.id);
    } else if (pick.category === "pasalubong_center") {
      setSelectedPasalubong(pick.id);
    }

    // ✅ clear state so it doesn’t re-apply on refresh/back
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    listTourStops("places_to_eat").then(setRestaurants);
    listTourStops("pasalubong_center").then(setPasalubong);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!serviceId || !instructorId) return;

      try {
        setErrorMsg("");
        setLoading(true);

        // 1) Load service by slug
        const { data: svc, error: svcErr } = await supabase
          .from("services")
          .select("id, slug, name")
          .eq("slug", serviceId)
          .single();

        if (svcErr) throw svcErr;

        // 2) Load instructor by UUID
        const { data: inst, error: instErr } = await supabase
          .from("instructors")
          .select("id, name, nickname")
          .eq("id", instructorId)
          .single();

        if (instErr) throw instErr;

        // 3) Validate relationship (recommended)
        const { data: link, error: linkErr } = await supabase
          .from("service_instructors")
          .select("service_id, instructor_id")
          .eq("service_id", svc.id)
          .eq("instructor_id", inst.id)
          .maybeSingle();

        if (linkErr) throw linkErr;
        if (!link)
          throw new Error("This instructor is not available for this service.");

        setService(svc as ServiceRow);
        setInstructor(inst as InstructorRow);
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : "Booking link is invalid.",
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [serviceId, instructorId]);

  const displayInstructorName = useMemo(() => {
    if (!instructor) return "";
    return instructor.nickname
      ? `${instructor.nickname} • ${instructor.name}`
      : instructor.name;
  }, [instructor]);

  const transportLabel =
    transport === "jeepney"
      ? "Jeepney"
      : transport === "tricycle"
        ? "Tricycle"
        : transport === "van"
          ? "Van"
          : "";

  const canSubmit = Boolean(date && time && service && instructor);

  if (!serviceId || !instructorId) {
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

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="rounded-2xl bg-white border p-6 md:p-8">
            <div className="h-6 w-64 rounded bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-80 rounded bg-gray-200 animate-pulse" />
            <div className="mt-8 h-64 w-full rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (errorMsg || !service || !instructor) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8 text-center">
          <h1 className="text-2xl font-semibold">Booking link is invalid</h1>
          <p className="mt-2 text-gray-600">
            {errorMsg || "Please try again."}
          </p>
          <Button className="mt-6" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <button
          onClick={() => navigate(`/services/${service.slug}/instructors`)}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back to Instructors
        </button>

        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          Book your session
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          <span className="font-medium text-gray-900">{service.name}</span> with{" "}
          <span className="font-medium text-gray-900">
            {displayInstructorName}
          </span>
        </p>

        {/* Summary line */}
        <div className="mb-8 rounded-xl border bg-white px-4 py-3 text-sm text-gray-700">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              <span className="text-gray-500">Driver:</span>{" "}
              <span className="font-medium text-gray-900">
                {transport ? "To be assigned" : "Not included"}
              </span>
            </span>
            <span>
              <span className="text-gray-500">Vehicle:</span>{" "}
              <span className="font-medium text-gray-900">
                {transportLabel || "Not selected"}
              </span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white border p-6 md:p-8">
          {/* Date */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-4">1. Select a Date</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
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

          {/* Transportation (Optional) */}
          <div className="mb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium mb-1">
                  Transportation (Optional)
                </h2>
                <p className="text-sm text-gray-600">
                  Select a vehicle if you want transportation included.{" "}
                  <span className="font-medium text-gray-900">
                    Driver will be assigned after confirmation.
                  </span>
                </p>
              </div>

              {transport ? (
                <button
                  type="button"
                  onClick={() => {
                    setTransport(null);
                    setPickupNotes("");
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-green-700 transition"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { id: "jeepney", label: "Jeepney" },
                { id: "tricycle", label: "Tricycle" },
                { id: "van", label: "Van" },
              ].map((opt) => {
                const isSelected = transport === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTransport(opt.id as TransportOption)}
                    className={`rounded-xl border px-4 py-3 text-sm transition text-left
                      ${isSelected ? "border-green-600 bg-green-50" : "hover:border-green-600 hover:bg-gray-50"}`}
                  >
                    <div className="font-medium text-gray-900">{opt.label}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isSelected ? "Selected" : "Optional"}
                    </div>
                  </button>
                );
              })}
            </div>

            {transport ? (
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
            ) : null}
          </div>

          {/* Tour Add-ons */}
          <div className="mb-14">
            <h2 className="text-xl font-semibold mb-2">Tour Add-ons</h2>
            <p className="text-sm text-gray-600 mb-6">
              Optional stops you can include in your booking to enhance the
              experience.
            </p>

            {/* Places to Eat */}
            <div className="mb-10">
              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900">
                  🍽️ Places to Eat (Optional)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select one restaurant to include during your tour.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {restaurants.map((r) => {
                  const isSelected = selectedRestaurant === r.id;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setSelectedRestaurant(isSelected ? null : r.id)
                      }
                      className={`group rounded-xl border px-4 py-4 text-left transition
            ${
              isSelected
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-green-600 hover:bg-gray-50"
            }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {r.name}
                          </p>

                          {r.description && (
                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {r.description}
                            </p>
                          )}

                          {/* View details */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();

                              const returnTo =
                                location.pathname + location.search;

                              navigate(`/tour-stop/${r.id}`, {
                                state: { returnTo },
                              });
                            }}
                            className="mt-2 inline-block text-xs text-green-700 hover:underline cursor-pointer"
                          >
                            View details →
                          </span>
                        </div>

                        <span
                          className={`shrink-0 text-xs font-medium rounded-full px-2 py-1
                ${
                  isSelected
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 my-10" />

            {/* Pasalubong Center */}
            <div>
              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900">
                  🛍️ Pasalubong Center (Optional)
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose one stop for local delicacies and souvenirs.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {pasalubong.map((p) => {
                  const isSelected = selectedPasalubong === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setSelectedPasalubong(isSelected ? null : p.id)
                      }
                      className={`group rounded-xl border px-4 py-4 text-left transition
            ${
              isSelected
                ? "border-green-600 bg-green-50"
                : "border-gray-200 hover:border-green-600 hover:bg-gray-50"
            }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {p.name}
                          </p>

                          {/* View details */}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();

                              const returnTo =
                                location.pathname + location.search;

                              navigate(`/tour-stop/${p.id}`, {
                                state: { returnTo },
                              });
                            }}
                            className="mt-1 inline-block text-xs text-green-700 hover:underline cursor-pointer"
                          >
                            View details →
                          </span>
                        </div>

                        <span
                          className={`text-xs font-medium rounded-full px-2 py-1
                ${
                  isSelected
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            disabled={!canSubmit}
            className="w-full md:w-auto bg-green-600 text-white hover:bg-green-700"
            onClick={async () => {
              try {
                const dateISO = date!.toISOString().slice(0, 10);

                const booking = await createBooking({
                  serviceId: service.id,
                  serviceName: service.name,
                  instructorId: instructor.id,
                  instructorName: instructor.name,
                  dateISO,
                  timeLabel: time!,
                  transport: transport ?? undefined,
                  pickupNotes: transport
                    ? pickupNotes.trim() || undefined
                    : undefined,
                  placesToEatStopId: selectedRestaurant,
                  pasalubongStopId: selectedPasalubong,
                });

                toast.success("Booking request sent!");
                navigate(`/booking/requested/${booking.id}`);
              } catch (err: unknown) {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : "Failed to create booking.",
                );
              }
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
