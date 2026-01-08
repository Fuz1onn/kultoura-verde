import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl px-8">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Learn Cultural Craftsmanship
          <br />
          from Local Artisans
        </h1>

        <p className="mt-6 max-w-2xl text-base md:text-lg text-gray-200">
          Discover pottery, baking, weaving, and other cultural crafts. Choose
          your preferred instructor, request a session, and we’ll handle the
          coordination for you.
        </p>

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
      </div>
    </section>
  );
};

export default Hero;
