import { useParams } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const serviceMap: Record<string, string> = {
  pottery: "Pottery Making",
  cuisine: "Local Cuisine Making",
  weaving: "Weaving",
};

const timeSlots = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"];

export default function Booking() {
  const { serviceId } = useParams();
  const serviceName = serviceMap[serviceId ?? ""];

  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <h1 className="text-3xl font-semibold mb-10">Book: {serviceName}</h1>

        {/* Step 1 */}
        <div className="mb-14">
          <h2 className="text-lg font-medium mb-4">1. Select a Date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(d) => d < new Date()}
            className="rounded-xl border p-4"
          />
        </div>

        {/* Step 2 */}
        <div className="mb-16">
          <h2 className="text-lg font-medium mb-4">2. Select a Time</h2>
          <div className="flex flex-wrap gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setTime(slot)}
                className={`
                  px-4 py-2 rounded-lg border text-sm
                  transition
                  ${
                    time === slot
                      ? "bg-green-600 text-white border-green-600"
                      : "hover:border-green-600"
                  }
                `}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          disabled={!date || !time}
          className="w-full md:w-auto"
        >
          Request Booking
        </Button>
      </div>
    </section>
  );
}
