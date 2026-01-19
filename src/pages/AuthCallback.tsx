import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      // If Supabase redirects with ?code=... (PKCE)
      const hasCode = new URL(window.location.href).searchParams.get("code");

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );
        if (error) {
          navigate("/auth?error=verification", { replace: true });
          return;
        }
      } else {
        // If Supabase redirects with #access_token=... (hash)
        // This will parse the URL and store the session automatically if possible
        // @ts-expect-error - method exists in supabase-js v2, TS types may vary by version
        const { error } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });

        if (error) {
          navigate("/auth?error=verification", { replace: true });
          return;
        }
      }

      const redirect = localStorage.getItem("kv_post_auth_redirect") || "/";
      localStorage.removeItem("kv_post_auth_redirect");
      navigate(redirect, { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-2xl px-6 md:px-8 text-center">
        <h1 className="text-2xl font-semibold">Verifying your email…</h1>
        <p className="mt-2 text-gray-600">You’ll be redirected shortly.</p>
      </div>
    </section>
  );
}
