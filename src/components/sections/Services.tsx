import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

const services = [
  {
    title: "Pottery",
    description: "Shape clay and create functional art with skilled artisans.",
    image: "/images/services/pottery.jpg",
  },
  {
    title: "Farming",
    description: "Learn hands-on farming practices from local growers.",
    image: "/images/services/farming.jpg",
  },
  {
    title: "Weaving",
    description: "Discover the beauty of handwoven textiles and patterns.",
    image: "/images/services/weaving.jpg",
  },
  {
    title: "Local Cuisine Making",
    description: "Cook traditional local dishes with experienced home chefs.",
    image: "/images/services/localcuisine.jpeg",
  },
];

const Services = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-gray-50 py-24">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-8 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Discover Cultural Experiences
          </h2>
          <p className="mt-4 text-gray-600">
            Choose from a variety of cultural craftsmanship experiences led by
            passionate local instructors.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm"
            >
              {/* Background Image */}
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm text-white/90">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
