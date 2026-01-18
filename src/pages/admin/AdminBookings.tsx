// src/pages/admin/AdminBookings.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingStatus, TransportOption } from "@/types/booking";
import {
  adminListBookings,
  adminConfirmBooking,
  adminRejectBooking,
  adminCompleteBooking,
  type AdminBooking,
} from "@/lib/bookingsAdmin";

function statusPill(status: BookingStatus) {
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

function transportLabel(t?: TransportOption) {
  if (!t) return "None";
  if (t === "jeepney") return "Jeepney";
  if (t === "tricycle") return "Tricycle";
  return "Van";
}

function formatDate(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBookings() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Local per-row inputs (driver/notes)
  const [driverDraft, setDriverDraft] = useState<Record<string, string>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string>("");

  const load = async () => {
    try {
      setErrorMsg("");
      setLoading(true);
      const data = await adminListBookings();
      setItems(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load admin bookings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirm = async (id: string) => {
    try {
      setBusyId(id);
      await adminConfirmBooking({
        id,
        driverName: driverDraft[id],
        adminNotes: notesDraft[id],
      });
      await load();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to confirm booking.",
      );
    } finally {
      setBusyId("");
    }
  };

  const reject = async (id: string) => {
    try {
      setBusyId(id);
      await adminRejectBooking({
        id,
        adminNotes: notesDraft[id],
      });
      await load();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to reject booking.",
      );
    } finally {
      setBusyId("");
    }
  };

  const complete = async (id: string) => {
    try {
      setBusyId(id);
      await adminCompleteBooking({ id });
      await load();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to complete booking.",
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Admin • Bookings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Confirm/reject requests and assign drivers.
            </p>
          </div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>

        {errorMsg ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white border p-8">
            <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-96 rounded bg-gray-200 animate-pulse" />
            <div className="mt-6 h-40 w-full rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl bg-white border p-10 text-center text-sm text-gray-700">
            No bookings found.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((b) => {
              const isBusy = busyId === b.id;
              return (
                <div key={b.id} className="rounded-2xl bg-white border p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {b.serviceName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusPill(b.status)}`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: <span className="font-mono">{b.id}</span>
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <div>
                          Instructor:{" "}
                          <span className="font-medium">
                            {b.instructorName}
                          </span>
                        </div>
                        <div>
                          Schedule:{" "}
                          <span className="font-medium">
                            {formatDate(b.dateISO)} • {b.timeLabel}
                          </span>
                        </div>
                        <div>
                          Transport:{" "}
                          <span className="font-medium">
                            {transportLabel(b.transport)}
                          </span>
                        </div>
                        <div>
                          Driver:{" "}
                          <span className="font-medium">{b.driver}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          User: <span className="font-mono">{b.userId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-90 space-y-3">
                      <input
                        value={driverDraft[b.id] ?? ""}
                        onChange={(e) =>
                          setDriverDraft((p) => ({
                            ...p,
                            [b.id]: e.target.value,
                          }))
                        }
                        placeholder="Driver name (optional)"
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <textarea
                        value={notesDraft[b.id] ?? ""}
                        onChange={(e) =>
                          setNotesDraft((p) => ({
                            ...p,
                            [b.id]: e.target.value,
                          }))
                        }
                        placeholder="Admin notes (optional)"
                        rows={3}
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                      />

                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="bg-green-600 text-white hover:bg-green-700"
                          disabled={isBusy || b.status !== "pending"}
                          onClick={() => confirm(b.id)}
                        >
                          {isBusy ? "Working..." : "Confirm"}
                        </Button>

                        <Button
                          variant="outline"
                          disabled={isBusy || b.status !== "pending"}
                          onClick={() => reject(b.id)}
                        >
                          Reject
                        </Button>

                        <Button
                          variant="outline"
                          disabled={isBusy || b.status !== "confirmed"}
                          onClick={() => complete(b.id)}
                        >
                          Mark Completed
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500">
                        Confirm/Reject only works while status is{" "}
                        <span className="font-medium">pending</span>.
                      </p>
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
