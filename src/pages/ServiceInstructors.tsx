// src/pages/ServiceInstructors.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { supabase } from "@/lib/supabaseClient";

type ServiceMeta = { title: string; subtitle: string };

type InstructorRow = {
  id: string;
  name: string;
  nickname: string | null;
  bio: string | null;
  craft_type: string | null;
  rate_min: number | null;
  rate_max: number | null;
  image_url: string | null;
};

const serviceMap: Record<string, ServiceMeta> = {
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

function peso(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function startsAtLabel(min: number | null, max: number | null) {
  if (min == null && max == null) return "Contact for rate";
  if (min != null && max != null && min !== max)
    return `Starts at ${peso(min)}`;
  if (min != null) return `Starts at ${peso(min)}`;
  if (max != null) return `${peso(max)}`;
  return "Contact for rate";
}

function shortBio(bio: string | null, limit = 120) {
  if (!bio) return "No bio available yet.";
  const s = bio.trim();
  if (s.length <= limit) return s;
  return s.slice(0, limit).trimEnd() + "…";
}

export default function ServiceInstructors() {
  const navigate = useNavigate();
  const { serviceId } = useParams(); // service slug, e.g. pottery/weaving
  const { user } = useAuth();

  const service = serviceMap[serviceId ?? ""];

  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const heading = useMemo(() => {
    if (!serviceId || !service) return null;
    return { serviceId, ...service };
  }, [serviceId, service]);

  useEffect(() => {
    const run = async () => {
      if (!serviceId) return;

      try {
        setErrorMsg("");
        setLoading(true);

        // serviceId is a slug in your routes.
        // We fetch instructors linked to services.slug = serviceId
        const { data, error } = await supabase
          .from("service_instructors")
          .select(
            `
            instructor:instructors (
              id,
              name,
              nickname,
              bio,
              craft_type,
              rate_min,
              rate_max,
              image_url
            ),
            service:services!inner (
              id,
              slug
            )
          `,
          )
          .eq("service.slug", serviceId);

        if (error) throw error;

        const list =
          (data ?? [])
            .map(
              (r) => (r as unknown as { instructor: InstructorRow }).instructor,
            )
            .filter(Boolean) ?? [];

        setInstructors(list);
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to load instructors.",
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [serviceId]);

  if (!heading) {
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
            <span className="font-medium text-gray-900">{heading.title}</span> —{" "}
            {heading.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="mt-6 h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-sm text-red-700">{errorMsg}</p>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : instructors.length === 0 ? (
          <div className="rounded-2xl bg-white border p-10 text-center">
            <h2 className="text-xl font-semibold">No instructors yet</h2>
            <p className="mt-2 text-gray-600">
              We’re currently preparing instructors for this experience.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => navigate("/services")}
            >
              Back to Services
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((inst) => {
              const displayName = inst.nickname
                ? `${inst.nickname} • ${inst.name}`
                : inst.name;

              const rateLabel = startsAtLabel(inst.rate_min, inst.rate_max);

              return (
                <div
                  key={inst.id}
                  className="rounded-2xl bg-white border p-6 hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden shrink-0 ring-2 ring-gray-100">
                      <img
                        src={
                          inst.image_url || "/images/instructor-placeholder.jpg"
                        }
                        alt={inst.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {displayName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {inst.craft_type || "Instructor"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                    {shortBio(inst.bio)}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rate</span>
                    <span className="font-semibold text-gray-900">
                      {rateLabel}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid gap-2">
                    {/* Optional profile link (works once you add the route) */}
                    <button
                      type="button"
                      onClick={() => navigate(`/instructors/${inst.id}`)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                    >
                      View profile
                    </button>

                    {/* ✅ Fixed button design */}
                    <Button
                      className="w-full bg-green-600 text-white hover:bg-green-700 rounded-xl py-6 text-sm font-semibold"
                      onClick={() => {
                        const target = `/booking/${serviceId}/${inst.id}`;
                        if (!user) {
                          navigate("/auth", { state: { from: target } });
                          return;
                        }
                        navigate(target);
                      }}
                    >
                      Select instructor
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
