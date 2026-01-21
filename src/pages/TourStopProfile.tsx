// src/pages/TourStopProfile.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type TourStop = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  email: string | null;
  mobile: string | null;
  image_urls: string[] | null;
  category: "places_to_eat" | "pasalubong_center";
};

export default function TourStopProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<TourStop | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo as string | undefined;

  useEffect(() => {
    if (!id) return;

    const run = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tour_stops")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setItem(data as TourStop);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const images = useMemo(() => item?.image_urls ?? [], [item]);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div className="rounded-2xl bg-white border p-6 md:p-10">
            <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
            <div className="mt-4 h-4 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="aspect-4/3 rounded-xl bg-gray-200 animate-pulse" />
              <div className="aspect-4/3 rounded-xl bg-gray-200 animate-pulse" />
              <div className="aspect-4/3 rounded-xl bg-gray-200 animate-pulse hidden md:block" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="min-h-screen bg-gray-50 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-gray-600 hover:text-green-700"
          >
            ← Back
          </button>

          <div className="rounded-2xl bg-white border p-8 text-sm text-gray-700">
            Tour stop not found.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-green-700"
          >
            ← Back to Booking
          </button>

          <span className="text-xs rounded-full bg-gray-100 text-gray-700 px-3 py-1">
            {item.category === "places_to_eat"
              ? "Places to Eat"
              : "Pasalubong Center"}
          </span>
        </div>

        <div className="rounded-2xl bg-white border overflow-hidden">
          {/* Hero / gallery */}
          {images.length ? (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-4/3 md:aspect-auto md:h-full bg-gray-100">
                <img
                  src={images[0]}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6 md:p-10">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {item.name}
                </h1>

                {item.description ? (
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                ) : (
                  <p className="mt-4 text-gray-500 text-sm">
                    No description available yet.
                  </p>
                )}

                {/* Info chips */}
                <div className="mt-6 space-y-2 text-sm text-gray-700">
                  {item.address ? (
                    <div className="rounded-xl bg-gray-50 border px-4 py-3">
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="font-medium text-gray-900">
                        {item.address}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid sm:grid-cols-2 gap-2">
                    {item.mobile ? (
                      <div className="rounded-xl bg-gray-50 border px-4 py-3">
                        <div className="text-xs text-gray-500">Contact</div>
                        <div className="font-medium text-gray-900">
                          {item.mobile}
                        </div>
                      </div>
                    ) : null}

                    {item.email ? (
                      <div className="rounded-xl bg-gray-50 border px-4 py-3">
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">
                          {item.email}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      navigate(returnTo ?? "/services", {
                        state: {
                          pickTourStop: {
                            id: item.id,
                            category: item.category,
                          },
                        },
                      });
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Add to Booking
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/services")}
                  >
                    Browse Services
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-10">
              <h1 className="text-3xl font-semibold text-gray-900">
                {item.name}
              </h1>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {item.description || "No description available yet."}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    navigate(returnTo ?? "/services", {
                      state: {
                        pickTourStop: {
                          id: item.id,
                          category: item.category,
                        },
                      },
                    });
                  }}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Add to Booking
                </Button>
              </div>
            </div>
          )}

          {/* Extra gallery thumbnails */}
          {images.length > 1 ? (
            <div className="border-t bg-white p-6 md:p-10">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(1).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={item.name}
                    className="rounded-xl object-cover aspect-4/3 bg-gray-100"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile sticky CTA (optional but nice) */}
        <div className="sm:hidden fixed bottom-4 left-0 right-0 px-4">
          <div className="mx-auto max-w-5xl rounded-2xl border bg-white shadow-lg p-3 flex gap-3">
            <Button
              onClick={() => {
                navigate(returnTo ?? "/services", {
                  state: {
                    pickTourStop: {
                      id: item.id,
                      category: item.category,
                    },
                  },
                });
              }}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
            >
              Add to Booking
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
