// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // Supabase will detect session from URL (hash or code) and persist it.
      await supabase.auth.getSession();

      const to = localStorage.getItem("kv_post_auth_redirect") || "/services";
      localStorage.removeItem("kv_post_auth_redirect");
      navigate(to, { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="rounded-2xl bg-white border p-8">
          <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
          <div className="mt-4 h-4 w-80 rounded bg-gray-200 animate-pulse" />
          <div className="mt-8 h-40 w-full rounded-2xl bg-gray-200 animate-pulse" />
          <p className="mt-6 text-sm text-gray-600">
            Finishing sign-in…
          </p>
        </div>
      </div>
    </section>
  );
}
