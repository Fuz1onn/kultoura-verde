// src/pages/InstructorProfile.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/useAuth";

type InstructorRow = {
  id: string;
  name: string;
  nickname: string | null;
  image_url: string | null;

  bio: string | null;
  community_involvement: string | null;
  special_recognition: string | null;
  passion_goals: string | null;

  craft_type: string | null;
  craft_types: string[] | null;

  products: string[] | null;
  related_skills: string[] | null;

  rate: number | null;
  rate_min: number | null;
  rate_max: number | null;
  rate_notes: string | null;

  materials_fee_min: number | null;
  materials_fee_max: number | null;

  target_learners: string | null;
  learning_outcomes: string | null;
  sample_product: string | null;
};

type ServiceMini = {
  id: string;
  slug: string;
  name: string;
};

function peso(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

function rateLabel(i: InstructorRow) {
  const min = i.rate_min;
  const max = i.rate_max;

  if (min == null && max == null && i.rate == null) return "Contact for rate";
  if (min != null && max != null && min !== max)
    return `Starts at ${peso(min)} (up to ${peso(max)})`;
  if (min != null) return `Starts at ${peso(min)}`;
  if (i.rate != null) return `${peso(i.rate)}`;
  if (max != null) return `${peso(max)}`;
  return "Contact for rate";
}

function sectionTitle(text: string) {
  return <h2 className="text-base font-semibold text-gray-900">{text}</h2>;
}

function pill(text: string) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      {text}
    </span>
  );
}

function renderWithBoldPrices(text: string) {
  // ₱1,000 | P1,000 | ₱800–₱2,000 | P800 - P2,000 (dash can be – or -)
  const re =
    /(₱|P)\s?\d{1,3}(?:,\d{3})*(?:\s?[–-]\s?(?:₱|P)?\s?\d{1,3}(?:,\d{3})*)?/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(re)) {
    const m = match[0];
    const index = match.index ?? 0;

    // text before the price
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    // the price itself (bold)
    nodes.push(
      <span key={`${index}-${m}`} className="font-semibold text-gray-900">
        {m}
      </span>,
    );

    lastIndex = index + m.length;
  }

  // remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function InstructorProfile() {
  const navigate = useNavigate();
  const { instructorId } = useParams();
  const { user } = useAuth();

  const [inst, setInst] = useState<InstructorRow | null>(null);
  const [services, setServices] = useState<ServiceMini[]>([]);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const displayName = useMemo(() => {
    if (!inst) return "";
    return inst.nickname ? `${inst.nickname} • ${inst.name}` : inst.name;
  }, [inst]);

  useEffect(() => {
    const run = async () => {
      if (!instructorId) return;

      try {
        setErrorMsg("");
        setLoading(true);

        // 1) instructor details
        const { data: instructorData, error: instErr } = await supabase
          .from("instructors")
          .select(
            `
            id,
            name,
            nickname,
            image_url,
            bio,
            community_involvement,
            special_recognition,
            passion_goals,
            craft_type,
            craft_types,
            products,
            related_skills,
            rate,
            rate_min,
            rate_max,
            rate_notes,
            materials_fee_min,
            materials_fee_max,
            target_learners,
            learning_outcomes,
            sample_product
          `,
          )
          .eq("id", instructorId)
          .single();

        if (instErr) throw instErr;
        setInst(instructorData as InstructorRow);

        // 2) services linked to this instructor (future-proof)
        const { data: siData, error: siErr } = await supabase
          .from("service_instructors")
          .select(
            `
            service:services!inner (
              id,
              slug,
              name
            )
          `,
          )
          .eq("instructor_id", instructorId);

        if (siErr) throw siErr;

        const svc =
          (siData ?? [])
            .map((r) => (r as unknown as { service: ServiceMini }).service)
            .filter(Boolean) ?? [];

        setServices(svc);

        // default selection:
        if (svc.length > 0) setSelectedServiceSlug(svc[0].slug);
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to load instructor.",
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [instructorId]);

  const goBook = () => {
    if (!inst) return;
    const slug = selectedServiceSlug;

    // If no linked service, fall back to services page.
    if (!slug) {
      navigate("/services");
      return;
    }

    const target = `/booking/${slug}/${inst.id}`;
    if (!user) {
      navigate("/auth", { state: { from: target } });
      return;
    }
    navigate(target);
  };

  if (!instructorId) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <h1 className="text-2xl font-semibold">Instructor not found</h1>
          <Button className="mt-6" onClick={() => navigate("/services")}>
            Back to Services
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back
        </button>

        {loading ? (
          <div className="rounded-2xl bg-white border p-8">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="mt-8 h-28 w-full rounded-2xl bg-gray-200 animate-pulse" />
          </div>
        ) : errorMsg ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="mt-2 text-sm text-red-700">{errorMsg}</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate("/services")}>
                Back to Services
              </Button>
            </div>
          </div>
        ) : !inst ? (
          <div className="rounded-2xl bg-white border p-10 text-center">
            <h2 className="text-xl font-semibold">Instructor not found</h2>
            <p className="mt-2 text-gray-600">
              This profile may have been removed.
            </p>
            <Button className="mt-6" onClick={() => navigate("/services")}>
              Back to Services
            </Button>
          </div>
        ) : (
          <>
            {/* Header card */}
            <div className="rounded-2xl bg-white border p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="h-20 w-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0 ring-2 ring-gray-100">
                    <img
                      src={
                        inst.image_url || "/images/instructor-placeholder.jpg"
                      }
                      alt={inst.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight truncate">
                      {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      {inst.craft_type || "Instructor"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(inst.craft_types && inst.craft_types.length > 0
                        ? inst.craft_types
                        : inst.craft_type
                          ? [inst.craft_type]
                          : []
                      ).map((c) => (
                        <span key={c}>{pill(c)}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[320px] rounded-2xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Rate</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {rateLabel(inst)}
                    </p>
                  </div>

                  {/* If multiple services later, allow selection */}
                  {services.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        Book under service
                      </p>
                      <select
                        value={selectedServiceSlug}
                        onChange={(e) => setSelectedServiceSlug(e.target.value)}
                        className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.slug}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <Button
                    onClick={goBook}
                    className="mt-4 w-full bg-green-600 text-white hover:bg-green-700 rounded-xl py-6 text-sm font-semibold"
                  >
                    Book this instructor
                  </Button>

                  {!user ? (
                    <p className="mt-2 text-xs text-gray-500">
                      You’ll be asked to log in first.
                    </p>
                  ) : null}
                </div>
              </div>

              {inst.bio ? (
                <p className="mt-6 text-sm text-gray-700 leading-relaxed">
                  {inst.bio}
                </p>
              ) : null}
            </div>

            {/* Details grid */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {inst.passion_goals ||
                inst.community_involvement ||
                inst.special_recognition ? (
                  <div className="rounded-2xl bg-white border p-6">
                    {sectionTitle("About")}
                    <div className="mt-4 space-y-4 text-sm text-gray-700">
                      {inst.passion_goals ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Passion / Goals
                          </p>
                          <p className="mt-1">{inst.passion_goals}</p>
                        </div>
                      ) : null}

                      {inst.community_involvement ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Community involvement
                          </p>
                          <p className="mt-1">{inst.community_involvement}</p>
                        </div>
                      ) : null}

                      {inst.special_recognition ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Awards / Recognition
                          </p>
                          <p className="mt-1">{inst.special_recognition}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {inst.products && inst.products.length > 0 ? (
                  <div className="rounded-2xl bg-white border p-6">
                    {sectionTitle("Products / Specialty items")}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inst.products.map((p) => (
                        <span key={p}>{pill(p)}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {inst.related_skills && inst.related_skills.length > 0 ? (
                  <div className="rounded-2xl bg-white border p-6">
                    {sectionTitle("Related skills")}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inst.related_skills.map((s) => (
                        <span key={s}>{pill(s)}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {inst.target_learners ||
                inst.learning_outcomes ||
                inst.sample_product ? (
                  <div className="rounded-2xl bg-white border p-6">
                    {sectionTitle("Workshop details")}
                    <div className="mt-4 space-y-4 text-sm text-gray-700">
                      {inst.target_learners ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Target learners
                          </p>
                          <p className="mt-1">{inst.target_learners}</p>
                        </div>
                      ) : null}

                      {inst.learning_outcomes ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Learning outcomes
                          </p>
                          <p className="mt-1">{inst.learning_outcomes}</p>
                        </div>
                      ) : null}

                      {inst.sample_product ? (
                        <div>
                          <p className="text-xs text-gray-500">
                            Sample product
                          </p>
                          <p className="mt-1">{inst.sample_product}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {inst.rate_notes ||
                inst.materials_fee_min != null ||
                inst.materials_fee_max != null ? (
                  <div className="rounded-2xl bg-white border p-6">
                    {sectionTitle("Pricing notes")}
                    <div className="mt-3 text-sm text-gray-700 space-y-3">
                      {inst.rate_notes ? (
                        <p>{renderWithBoldPrices(inst.rate_notes)}</p>
                      ) : null}

                      {inst.materials_fee_min != null ||
                      inst.materials_fee_max != null ? (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">Materials fee:</span>{" "}
                          <span className="font-medium text-gray-900">
                            {inst.materials_fee_min != null
                              ? `${peso(inst.materials_fee_min)}`
                              : ""}
                            {inst.materials_fee_max != null
                              ? ` – ${peso(inst.materials_fee_max)}`
                              : ""}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
