import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "pottery",
    title: "Pottery Making",
    description: "Shape clay and create functional art with skilled artisans.",
    meta: "Hands-on Craft",
  },
  {
    id: "farming",
    title: "Farming",
    description: "Learn hands-on farming practices from local growers.",
    meta: "Outdoor Experience",
  },
  {
    id: "weaving",
    title: "Weaving",
    description:
      "Craft beautiful textiles using traditional weaving techniques.",
    meta: "Traditional Craft",
  },
  {
    id: "cuisine",
    title: "Local Cuisine Making",
    description: "Cook traditional dishes with experienced local cooks.",
    meta: "Culinary Experience",
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Choose a Service
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Browse cultural crafts and select the experience you want to learn.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/services/${s.id}/instructors`)}
              className="group cursor-pointer rounded-2xl bg-white border p-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-green-600 transition-all"
            >
              <span className="text-xs uppercase tracking-wide text-gray-500">
                {s.meta}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{s.description}</p>

              <div className="mt-6 text-sm font-medium text-green-700 inline-flex items-center gap-1">
                View instructors{" "}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
