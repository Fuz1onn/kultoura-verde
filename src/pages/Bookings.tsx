import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Booking, BookingStatus, TransportOption } from "@/types/booking";
import { cancelMyBooking, listMyBookings } from "@/lib/bookings";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/useAuth";

type StatusFilter = "all" | "pending" | "confirmed" | "completed";

function statusBadge(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-gray-100 text-gray-800";
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

function transportLabel(t?: TransportOption) {
  if (!t) return "None";
  if (t === "jeepney") return "Jeepney";
  if (t === "tricycle") return "Tricycle";
  return "Van";
}

export default function Bookings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string>("");

  const load = async () => {
    try {
      setErrorMsg("");
      setLoading(true);
      const data = await listMyBookings();
      setBookings(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  // ✅ Auto-refresh when booking status changes (Realtime)
  useEffect(() => {
    if (authLoading || !user) return;

    const channel = supabase
      .channel(`kv-bookings-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Any insert/update/delete for this user's bookings → refresh list
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  // ✅ Polling fallback (in case realtime is off / blocked)
  useEffect(() => {
    if (authLoading || !user) return;
    const t = window.setInterval(() => {
      load();
    }, 15000); // 15s
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const counts = useMemo(() => {
    const base = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
    };
    for (const b of bookings) {
      if (b.status === "pending") base.pending++;
      if (b.status === "confirmed") base.confirmed++;
      if (b.status === "completed") base.completed++;
    }
    return base;
  }, [bookings]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const onCancel = async (bookingId: string) => {
    const ok = window.confirm("Cancel this booking?");
    if (!ok) return;

    try {
      setBusyId(bookingId);
      await cancelMyBooking(bookingId);
      await load();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to cancel booking.",
      );
    } finally {
      setBusyId("");
    }
  };

  const filterBtn = (key: StatusFilter, label: string, count: number) => {
    const active = statusFilter === key;
    return (
      <button
        type="button"
        onClick={() => setStatusFilter(key)}
        className={`rounded-full px-4 py-2 text-sm font-medium border transition
          ${
            active
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-green-600 hover:text-green-700"
          }`}
      >
        {label}{" "}
        <span className={active ? "text-white/90" : "text-gray-500"}>
          ({count})
        </span>
      </button>
    );
  };

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-sm text-gray-600 hover:text-green-700"
        >
          ← Back to Home
        </button>

        <div className="flex items-end justify-between mb-6">
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
            <Button variant="outline" onClick={load} title="Reload bookings">
              Refresh
            </Button>
          </div>
        </div>

        {/* ✅ Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {filterBtn("all", "All", counts.all)}
          {filterBtn("pending", "Pending", counts.pending)}
          {filterBtn("confirmed", "Confirmed", counts.confirmed)}
          {filterBtn("completed", "Completed", counts.completed)}
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">Loading bookings…</h2>
            <p className="mt-2 text-gray-600">Please wait.</p>
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-sm text-red-700">{errorMsg}</p>
            <div className="mt-4">
              <Button variant="outline" onClick={load}>
                Try again
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No bookings found</h2>
            <p className="mt-2 text-gray-600">
              Try another filter or book a service.
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
            {filtered.map((b) => {
              const addOns =
                [
                  b.placesToEatStopId ? "Places to Eat" : null,
                  b.pasalubongStopId ? "Pasalubong Center" : null,
                ]
                  .filter(Boolean)
                  .join(", ") || null;

              const canCancel =
                b.status === "pending" || b.status === "confirmed";
              const isBusy = busyId === b.id;

              return (
                <div key={b.id} className="rounded-2xl bg-white border p-6">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {b.serviceName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
                            b.status,
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
                        Transportation:{" "}
                        <span className="font-medium text-gray-900">
                          {transportLabel(b.transport)}
                        </span>{" "}
                        {b.transport ? (
                          <span className="text-gray-500">
                            (Driver:{" "}
                            {b.driver && b.driver !== "to_be_assigned"
                              ? b.driver
                              : "To be assigned"}
                            )
                          </span>
                        ) : null}
                      </p>

                      {addOns ? (
                        <p className="text-sm text-gray-600">
                          Add-ons:{" "}
                          <span className="font-medium text-gray-900">
                            {addOns}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/booking/requested/${b.id}`)}
                      >
                        View
                      </Button>

                      {/* ✅ Cancel booking (users) */}
                      <Button
                        variant="outline"
                        disabled={!canCancel || isBusy}
                        onClick={() => onCancel(b.id)}
                        className={
                          canCancel
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : ""
                        }
                        title={
                          canCancel
                            ? "Cancel this booking"
                            : "Only pending/confirmed bookings can be cancelled"
                        }
                      >
                        {isBusy ? "Cancelling..." : "Cancel"}
                      </Button>
                    </div>
                  </div>

                  {b.pickupNotes ? (
                    <div className="mt-4 rounded-xl bg-gray-50 border px-4 py-3">
                      <p className="text-xs text-gray-500">Pickup Notes</p>
                      <p className="text-sm text-gray-800">{b.pickupNotes}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
