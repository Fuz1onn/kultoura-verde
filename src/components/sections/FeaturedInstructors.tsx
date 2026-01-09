import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";
import rosarioImg from "../../assets/images/instructors/rosario.jpg";
import alferImg from "../../assets/images/instructors/alfer.jpg";

const instructors = [
  {
    name: "Alfer Tangol",
    craft: "Pottery Artist",
    description: "10+ years shaping functional and decorative ceramics.",
    image: alferImg,
  },
  {
    name: "Rosario Bautista",
    craft: "Traditional Handwoven Buntal Weaving",
    description:
      "Expert in crafting beautiful buntal products using age-old techniques.",
    image: rosarioImg,
  },
  {
    name: "Juan Dela Cruz",
    craft: "Organic Farming Expert",
    description: "Passionate about sustainable agriculture and local crops.",
    image: "/images/instructors/ana.jpg",
  },
];

const FeaturedInstructors = () => {
  const { ref, isVisible } = useFadeInOnScroll();

  return (
    <section className="bg-white py-24">
      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-8 transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Meet Our Instructors
          </h2>
          <p className="mt-4 text-gray-600">
            Learn directly from skilled artisans who are passionate about
            sharing their craft and culture.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <div
              key={instructor.name}
              className="group rounded-2xl overflow-hidden shadow-sm border bg-white"
            >
              <img
                src={instructor.image}
                alt={instructor.name}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {instructor.name}
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  {instructor.craft}
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  {instructor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstructors;
