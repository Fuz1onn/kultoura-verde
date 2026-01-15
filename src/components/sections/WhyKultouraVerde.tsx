import { Leaf, Users, CalendarClock } from "lucide-react";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

const reasons = [
  {
    icon: Leaf,
    title: "Authentic Cultural Experiences",
    description: "Learn crafts rooted in tradition and cultural heritage.",
  },
  {
    icon: Users,
    title: "Expert Local Artisans",
    description: "Handpicked instructors with years of real-world experience.",
  },
  {
    icon: CalendarClock,
    title: "Thoughtful Booking Process",
    description:
      "We personally coordinate with instructors to ensure quality sessions.",
  },
];

const WhyKultouraVerde = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-white py-24">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-8 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Kultoura Verde
          </h2>
          <p className="mt-4 text-gray-600">
            More than just a booking platform — it’s a cultural experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyKultouraVerde;
