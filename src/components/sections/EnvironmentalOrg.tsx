// src/components/sections/EnvironmentalOrg.tsx
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

export default function EnvironmentalOrg() {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-gray-50 from-white to-gray-50 py-24">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-6 md:px-8 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              Environmental org
            </p>

            <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Book with purpose.
            </h2>

            <p className="mt-4 text-gray-700 leading-relaxed">
              Book with purpose! 5% of what we earn from every booking supports{" "}
              <span className="font-semibold">Greenpeace Philippines</span>,
              helping protect forests (40%), oceans (22%), climate and energy
              solutions (16%), sustainable living (8%), and other vital
              environmental causes (14%). Your journey makes a difference.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Forests • 40%",
                "Oceans • 22%",
                "Climate & Energy • 16%",
                "Sustainable Living • 8%",
                "Other Causes • 14%",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Impact summary
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Every booking contributes to verified environmental work and
                    local awareness initiatives.
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-green-50 px-3 py-2 text-center">
                  <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">
                    Donation
                  </p>
                  <p className="text-lg font-bold text-green-800 leading-none">
                    5%
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Allocation percentages reflect how donations are distributed
                  across key programs and may vary by campaign.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
