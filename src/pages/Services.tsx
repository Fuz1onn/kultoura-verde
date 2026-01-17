import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "pottery",
    title: "Pottery Making",
    description: "Shape clay and create functional art with skilled artisans.",
  },
  {
    id: "cuisine",
    title: "Local Cuisine Making",
    description: "Cook traditional dishes with experienced local cooks.",
  },
  {
    id: "weaving",
    title: "Weaving",
    description:
      "Craft beautiful textiles using traditional weaving techniques.",
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="mb-14">
          <h1 className="text-4xl font-semibold mb-4">Choose a Service</h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse cultural crafts and select the experience you want to learn.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/booking/${service.id}`)}
              className="
                group cursor-pointer rounded-2xl border p-6
                hover:shadow-lg hover:-translate-y-1
                transition-all duration-300
              "
            >
              <h3 className="text-xl font-medium mb-2 group-hover:text-green-700">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {service.description}
              </p>

              <span className="text-sm font-medium text-green-700">
                Book now →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
