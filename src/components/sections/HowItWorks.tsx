import { CalendarCheck, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "Browse Services",
    description:
      "Explore pottery, baking, weaving, and other cultural crafts offered by experienced local artisans.",
  },
  {
    icon: CalendarCheck,
    title: "Request a Booking",
    description:
      "Choose your preferred instructor, date, and time. No payment required at this stage.",
  },
  {
    icon: Bell,
    title: "We Confirm & Notify You",
    description:
      "We coordinate with the instructor and notify you once your booking is confirmed.",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-white text-black py-24" id="how-it-works">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-8 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-gray-600">
            Booking a cultural experience is simple and hassle-free.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600">
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>

                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/services")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Browse Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
