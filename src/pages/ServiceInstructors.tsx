// src/pages/ServiceInstructors.tsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Instructor = {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  priceLabel: string;
  avatarUrl?: string;
};

const serviceMap: Record<string, { title: string; subtitle: string }> = {
  pottery: {
    title: "Pottery Making",
    subtitle: "Choose an instructor to guide your clay session.",
  },
  farming: {
    title: "Farming",
    subtitle: "Pick a mentor for hands-on farming practices.",
  },
  weaving: {
    title: "Weaving",
    subtitle: "Select a weaver to teach traditional techniques.",
  },
  cuisine: {
    title: "Local Cuisine Making",
    subtitle: "Choose a cook to guide your local dishes.",
  },
};

const instructorsByService: Record<string, Instructor[]> = {
  pottery: [
    {
      id: "maria-santos",
      name: "Maria Santos",
      specialty: "Wheel-throwing & glazing",
      location: "Laguna",
      experience: "8 yrs experience",
      priceLabel: "₱900 / session",
      avatarUrl: "/images/instructors/pottery-1.jpg",
    },
    {
      id: "jon-reyes",
      name: "Jon Reyes",
      specialty: "Hand-building & sculpting",
      location: "Pampanga",
      experience: "6 yrs experience",
      priceLabel: "₱800 / session",
      avatarUrl: "/images/instructors/pottery-2.jpg",
    },
    {
      id: "luna-cruz",
      name: "Luna Cruz",
      specialty: "Functional ware",
      location: "Quezon",
      experience: "5 yrs experience",
      priceLabel: "₱750 / session",
      avatarUrl: "/images/instructors/pottery-3.jpg",
    },
  ],
  farming: [
    {
      id: "ka-nilo",
      name: "Ka Nilo",
      specialty: "Organic vegetable farming",
      location: "Batangas",
      experience: "10 yrs experience",
      priceLabel: "₱700 / session",
      avatarUrl: "/images/instructors/farming-1.jpg",
    },
    {
      id: "ana-delosreyes",
      name: "Ana D.",
      specialty: "Composting & soil health",
      location: "Rizal",
      experience: "7 yrs experience",
      priceLabel: "₱650 / session",
      avatarUrl: "/images/instructors/farming-2.jpg",
    },
    {
      id: "paolo-vergara",
      name: "Paolo Vergara",
      specialty: "Urban gardening",
      location: "Metro Manila",
      experience: "5 yrs experience",
      priceLabel: "₱600 / session",
      avatarUrl: "/images/instructors/farming-3.jpg",
    },
  ],
  weaving: [
    {
      id: "althea-ramirez",
      name: "Althea Ramirez",
      specialty: "Basic loom weaving",
      location: "Ilocos",
      experience: "9 yrs experience",
      priceLabel: "₱850 / session",
      avatarUrl: "/images/instructors/weaving-1.jpg",
    },
    {
      id: "tomas-bautista",
      name: "Tomas Bautista",
      specialty: "Patterns & textile design",
      location: "Bicol",
      experience: "6 yrs experience",
      priceLabel: "₱800 / session",
      avatarUrl: "/images/instructors/weaving-2.jpg",
    },
    {
      id: "mina-uy",
      name: "Mina Uy",
      specialty: "Natural dye weaving",
      location: "Mindoro",
      experience: "5 yrs experience",
      priceLabel: "₱750 / session",
      avatarUrl: "/images/instructors/weaving-3.jpg",
    },
  ],
  cuisine: [
    {
      id: "chef-elia",
      name: "Chef Elia",
      specialty: "Classic Filipino dishes",
      location: "Cavite",
      experience: "8 yrs experience",
      priceLabel: "₱900 / session",
      avatarUrl: "/images/instructors/cuisine-1.jpg",
    },
    {
      id: "tita-nene",
      name: "Tita Nene",
      specialty: "Home-style cooking",
      location: "Bulacan",
      experience: "12 yrs experience",
      priceLabel: "₱850 / session",
      avatarUrl: "/images/instructors/cuisine-2.jpg",
    },
    {
      id: "marco-sy",
      name: "Marco Sy",
      specialty: "Street food & snacks",
      location: "Cebu",
      experience: "6 yrs experience",
      priceLabel: "₱800 / session",
      avatarUrl: "/images/instructors/cuisine-3.jpg",
    },
  ],
};

export default function ServiceInstructors() {
  const navigate = useNavigate();
  const { serviceId } = useParams();

  const service = serviceMap[serviceId ?? ""];
  const instructors = useMemo(
    () => instructorsByService[serviceId ?? ""] ?? [],
    [serviceId]
  );

  if (!serviceId || !service) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 md:px-8 text-center">
          <h1 className="text-2xl font-semibold">Service not found</h1>
          <p className="mt-2 text-gray-600">
            Please go back and choose a service.
          </p>
          <Button className="mt-6" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          onClick={() => navigate("/services")}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back to Services
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight">
            Choose an Instructor
          </h1>
          <p className="mt-3 text-gray-600">
            For{" "}
            <span className="font-medium text-gray-900">{service.title}</span> —{" "}
            {service.subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((inst) => (
            <div
              key={inst.id}
              className="rounded-2xl bg-white border p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                  {inst.avatarUrl ? (
                    <img
                      src={inst.avatarUrl}
                      alt={inst.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {inst.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {inst.specialty}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="text-gray-900 font-medium">Location:</span>{" "}
                  {inst.location}
                </p>
                <p>
                  <span className="text-gray-900 font-medium">Experience:</span>{" "}
                  {inst.experience}
                </p>
                <p>
                  <span className="text-gray-900 font-medium">Rate:</span>{" "}
                  {inst.priceLabel}
                </p>
              </div>

              <Button
                className="w-full mt-6 bg-green-600 text-white hover:bg-green-700"
                onClick={() => navigate(`/booking/${serviceId}/${inst.id}`)}
              >
                Select Instructor
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
