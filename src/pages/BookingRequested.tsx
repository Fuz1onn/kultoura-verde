// src/pages/BookingRequested.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Booking, BookingStatus, TransportOption } from "@/types/booking";
import { getBookingById } from "@/lib/bookings";
import { supabase } from "@/lib/supabaseClient";

type LocationState = { booking?: Booking };

type DriverProfile = {
  id: string;
  full_name: string;
  vehicle_type: TransportOption;
  years_experience: number;
  contact_number: string;
  driver_license_no: string;
  rate: number;
  rate_unit: "per_trip" | "per_hour" | "per_day";
  image_url: string | null;
};

type TourStopMini = {
  id: string;
  name: string;
  type: "places_to_eat" | "pasalubong_center";
  address: string | null;
  mobile: string | null;
  email: string | null;
};

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

function rateUnitLabel(u: DriverProfile["rate_unit"]) {
  if (u === "per_day") return "per day";
  if (u === "per_hour") return "per hour";
  return "per trip";
}

function statusMeta(status: BookingStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        pill: "bg-yellow-100 text-yellow-800 border-yellow-200",
        title: "Request sent!",
        subtitle:
          "We’ll notify you once the admin confirms availability and assigns a driver (if transport is included).",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        pill: "bg-green-100 text-green-800 border-green-200",
        title: "Booking confirmed!",
        subtitle: "Your booking is confirmed. Review details below.",
      };
    case "rejected":
      return {
        label: "Rejected",
        pill: "bg-red-100 text-red-800 border-red-200",
        title: "Booking update",
        subtitle:
          "This booking was rejected. You can book another service anytime.",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        pill: "bg-gray-100 text-gray-800 border-gray-200",
        title: "Booking update",
        subtitle: "This booking was cancelled.",
      };
    case "completed":
      return {
        label: "Completed",
        pill: "bg-blue-100 text-blue-800 border-blue-200",
        title: "Booking completed!",
        subtitle: "Thanks for visiting! Hope you enjoyed your tour.",
      };
  }
}

function getDriverIdFromBooking(b: Booking | null): string | null {
  if (!b) return null;
  const anyB = b as any;
  return (anyB.driverId ?? anyB.driver_id ?? null) as string | null;
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

  // driver + add-on lookup
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(
    null,
  );
  const [driverLoading, setDriverLoading] = useState(false);

  const [stopsById, setStopsById] = useState<Record<string, TourStopMini>>({});
  const [stopsLoading, setStopsLoading] = useState(false);

  // -------------------------------
  // Load booking (+ polling)
  // -------------------------------
  useEffect(() => {
    let alive = true;
    let intervalId: number | null = null;

    const fetchBooking = async () => {
      if (!bookingId) return;

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
          if (!prev) return b;

          const prevDriverId = getDriverIdFromBooking(prev);
          const nextDriverId = getDriverIdFromBooking(b);

          if (
            prev.status === b.status &&
            prev.driver === b.driver &&
            prev.adminNotes === b.adminNotes &&
            prevDriverId === nextDriverId &&
            prev.placesToEatStopId === b.placesToEatStopId &&
            prev.pasalubongStopId === b.pasalubongStopId
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

    const shouldPoll =
      booking?.status === "pending" || booking?.status === "confirmed";

    fetchBooking();

    if (shouldPoll) {
      intervalId = window.setInterval(fetchBooking, 6000);
    }

    return () => {
      alive = false;
      if (intervalId) window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, bookingFromState]);

  // -------------------------------
  // Load driver profile (confirmed only)
  // -------------------------------
  useEffect(() => {
    let alive = true;

    const run = async () => {
      const driverId = getDriverIdFromBooking(booking);
      const shouldShow = booking?.status === "confirmed" && !!driverId;

      if (!shouldShow) {
        setDriverProfile(null);
        setDriverLoading(false);
        return;
      }

      try {
        setDriverLoading(true);

        const { data, error } = await supabase
          .from("drivers")
          .select(
            "id, full_name, vehicle_type, years_experience, contact_number, driver_license_no, rate, rate_unit, image_url",
          )
          .eq("id", driverId)
          .single();

        if (!alive) return;

        if (error || !data) {
          setDriverProfile(null);
          return;
        }

        setDriverProfile(data as DriverProfile);
      } finally {
        if (alive) setDriverLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [booking?.status, getDriverIdFromBooking(booking)]);

  // -------------------------------
  // Load selected add-on stop names
  // -------------------------------
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!booking) {
        setStopsById({});
        return;
      }

      const ids = Array.from(
        new Set(
          [booking.placesToEatStopId, booking.pasalubongStopId].filter(
            Boolean,
          ) as string[],
        ),
      );

      if (!ids.length) {
        setStopsById({});
        return;
      }

      try {
        setStopsLoading(true);
        const { data, error } = await supabase
          .from("tour_stops")
          .select("id, name, type, address, mobile, email")
          .in("id", ids);

        if (!alive) return;
        if (error || !data) return;

        const map: Record<string, TourStopMini> = {};
        for (const s of data as any[]) map[s.id] = s as TourStopMini;
        setStopsById(map);
      } finally {
        if (alive) setStopsLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [booking?.placesToEatStopId, booking?.pasalubongStopId]);

  const stopRestaurant = useMemo(() => {
    if (!booking?.placesToEatStopId) return null;
    return stopsById[booking.placesToEatStopId] ?? null;
  }, [booking?.placesToEatStopId, stopsById]);

  const stopPasalubong = useMemo(() => {
    if (!booking?.pasalubongStopId) return null;
    return stopsById[booking.pasalubongStopId] ?? null;
  }, [booking?.pasalubongStopId, stopsById]);

  const hasAddOns = !!(booking?.placesToEatStopId || booking?.pasalubongStopId);

  // -------------------------------
  // Render: missing id
  // -------------------------------
  if (!bookingId) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
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

  // -------------------------------
  // Render: loading skeleton
  // -------------------------------
  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div className="rounded-3xl bg-white border shadow-sm p-6 md:p-10">
            <div className="h-7 w-52 rounded bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded bg-gray-200 animate-pulse" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
            </div>
            <div className="mt-6 h-28 rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------
  // Render: not found
  // -------------------------------
  if (!booking) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
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

  const meta = statusMeta(booking.status);
  const driverId = getDriverIdFromBooking(booking);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/bookings")}
            className="text-sm text-gray-600 hover:text-green-700"
          >
            ← Back to My Bookings
          </button>

          <span className="text-xs text-gray-500">
            Reference ID: <span className="font-mono">{booking.id}</span>
          </span>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white border shadow-sm overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-green-50 to-white border-b p-6 md:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                  {meta.title}
                </h1>
                <p className="mt-2 text-gray-600">{meta.subtitle}</p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border ${meta.pill}`}
              >
                {meta.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            {/* Key Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Service</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.serviceName}
                </p>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Instructor</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {booking.instructorName}
                </p>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Schedule</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {formatDate(booking.dateISO)} • {booking.timeLabel}
                </p>
              </div>

              <div className="rounded-2xl border bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Transportation</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {transportLabel(booking.transport)}
                </p>

                {booking.transport ? (
                  <p className="mt-2 text-xs text-gray-600">
                    {booking.status !== "confirmed"
                      ? "Driver details will appear after confirmation."
                      : driverId
                        ? "Driver assigned (see below)."
                        : "Driver not assigned yet."}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-gray-600">
                    Transportation not included.
                  </p>
                )}
              </div>
            </div>

            {/* Add-ons */}
            {hasAddOns ? (
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Tour Add-ons
                  </h2>
                  {stopsLoading ? (
                    <span className="text-xs text-gray-500">Loading…</span>
                  ) : null}
                </div>

                <div className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                  {/* Places to Eat */}
                  {booking.placesToEatStopId ? (
                    <div className="p-4 md:p-5 bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Places to Eat</p>
                          <p className="mt-1 font-semibold text-gray-900 truncate">
                            {stopsLoading
                              ? "Loading…"
                              : (stopRestaurant?.name ?? "Not found")}
                          </p>

                          {/* Address */}
                          {stopRestaurant?.address ? (
                            <p className="mt-1 text-sm text-gray-600">
                              {stopRestaurant.address}
                            </p>
                          ) : null}

                          {/* Contact */}
                          {stopRestaurant?.mobile || stopRestaurant?.email ? (
                            <p className="mt-2 text-xs text-gray-500">
                              {stopRestaurant.mobile ? (
                                <span className="mr-3">
                                  Contact:{" "}
                                  <a
                                    className="text-green-700 hover:underline"
                                    href={`tel:${stopRestaurant.mobile}`}
                                  >
                                    {stopRestaurant.mobile}
                                  </a>
                                </span>
                              ) : null}
                              {stopRestaurant.email ? (
                                <span>
                                  Email:{" "}
                                  <a
                                    className="text-green-700 hover:underline"
                                    href={`mailto:${stopRestaurant.email}`}
                                  >
                                    {stopRestaurant.email}
                                  </a>
                                </span>
                              ) : null}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/tour-stop/${booking.placesToEatStopId}`,
                              {
                                state: {
                                  returnTo: `/booking/requested/${booking.id}`,
                                },
                              },
                            )
                          }
                          className="text-sm text-green-700 hover:underline shrink-0"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Divider if both exist */}
                  {booking.placesToEatStopId && booking.pasalubongStopId ? (
                    <div className="h-px bg-gray-100" />
                  ) : null}

                  {/* Pasalubong */}
                  {booking.pasalubongStopId ? (
                    <div className="p-4 md:p-5 bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            Pasalubong Center
                          </p>
                          <p className="mt-1 font-semibold text-gray-900 truncate">
                            {stopsLoading
                              ? "Loading…"
                              : (stopPasalubong?.name ?? "Not found")}
                          </p>

                          {/* Address */}
                          {stopPasalubong?.address ? (
                            <p className="mt-1 text-sm text-gray-600">
                              {stopPasalubong.address}
                            </p>
                          ) : null}

                          {/* Contact */}
                          {stopPasalubong?.mobile || stopPasalubong?.email ? (
                            <p className="mt-2 text-xs text-gray-500">
                              {stopPasalubong.mobile ? (
                                <span className="mr-3">
                                  Contact:{" "}
                                  <a
                                    className="text-green-700 hover:underline"
                                    href={`tel:${stopPasalubong.mobile}`}
                                  >
                                    {stopPasalubong.mobile}
                                  </a>
                                </span>
                              ) : null}
                              {stopPasalubong.email ? (
                                <span>
                                  Email:{" "}
                                  <a
                                    className="text-green-700 hover:underline"
                                    href={`mailto:${stopPasalubong.email}`}
                                  >
                                    {stopPasalubong.email}
                                  </a>
                                </span>
                              ) : null}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/tour-stop/${booking.pasalubongStopId}`, {
                              state: {
                                returnTo: `/booking/requested/${booking.id}`,
                              },
                            })
                          }
                          className="text-sm text-green-700 hover:underline shrink-0"
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Driver Card (confirmed only) */}
            {booking.status === "confirmed" && driverId ? (
              <div className="mt-8">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">
                  Assigned Driver
                </h2>

                {driverLoading ? (
                  <div className="h-64 rounded-3xl bg-gray-200 animate-pulse" />
                ) : driverProfile ? (
                  <div className="rounded-3xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                    <div className="grid md:grid-cols-2">
                      {/* IMAGE SIDE */}
                      <div className="relative h-64 md:h-full bg-gray-100">
                        {driverProfile.image_url ? (
                          <img
                            src={driverProfile.image_url}
                            alt={driverProfile.full_name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            No photo
                          </div>
                        )}

                        {/* Vehicle badge */}
                        <div className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-medium text-gray-900 shadow">
                          {driverProfile.vehicle_type.toUpperCase()}
                        </div>
                      </div>

                      {/* DETAILS SIDE */}
                      <div className="p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <p className="text-2xl font-semibold text-gray-900">
                            {driverProfile.full_name}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {driverProfile.years_experience} years experience •
                            Professional license
                          </p>

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs text-gray-500">Contact</p>
                              <a
                                href={`tel:${driverProfile.contact_number}`}
                                className="mt-1 block font-medium text-green-700 hover:underline"
                              >
                                {driverProfile.contact_number}
                              </a>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Rate</p>
                              <p className="mt-1 font-medium text-gray-900">
                                ₱{Number(driverProfile.rate).toLocaleString()}{" "}
                                {rateUnitLabel(driverProfile.rate_unit)}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-1">
                                Amount may vary depending on arrangement.
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="mt-6 text-[11px] text-gray-500">
                          License No: {driverProfile.driver_license_no}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Driver details not available yet.
                  </p>
                )}
              </div>
            ) : null}

            {/* Notes */}
            {booking.pickupNotes ? (
              <div className="mt-6 rounded-2xl border bg-gray-50 p-5">
                <p className="text-xs text-gray-500">Pickup Notes</p>
                <p className="mt-1 text-sm text-gray-800">
                  {booking.pickupNotes}
                </p>
              </div>
            ) : null}

            {booking.adminNotes ? (
              <div className="mt-4 rounded-2xl border bg-gray-50 p-5">
                <p className="text-xs text-gray-500">Admin Notes</p>
                <p className="mt-1 text-sm text-gray-800">
                  {booking.adminNotes}
                </p>
              </div>
            ) : null}

            {/* Actions */}
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
          </div>
        </div>
      </div>
    </section>
  );
}
