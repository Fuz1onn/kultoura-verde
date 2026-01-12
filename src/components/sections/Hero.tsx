import { Button } from "@/components/ui/button";

const services = [
  { label: "Pottery", value: "pottery" },
  { label: "Local Cuisine", value: "cuisine" },
  { label: "Weaving", value: "weaving" },
  { label: "More Crafts", value: "others" },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <img
        src="/images/background.jpg"
        alt="Cultural craftsmanship"
        className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-5xl px-8">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Learn Cultural Craftsmanship
          <br />
          from Local Artisans
        </h1>

        <p className="mt-6 max-w-2xl text-base md:text-lg text-gray-200">
          Discover pottery, farming, weaving, and other cultural crafts. Choose
          your preferred instructor and request a session.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Browse Services
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
          >
            How It Works
          </Button>
        </div>

        {/* Service Highlights */}
        <div className="mt-12 flex flex-wrap gap-3">
          {services.map((service) => (
            <a
              key={service.value}
              href={`/services?category=${service.value}`}
              className="px-4 py-2 rounded-full border border-white/40 text-sm hover:bg-white hover:text-black transition"
            >
              {service.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
