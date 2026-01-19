// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

function getRedirectPath() {
  const from = localStorage.getItem("kv_post_auth_redirect");
  localStorage.removeItem("kv_post_auth_redirect");
  return from || "/services";
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email…");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        // Give Supabase a moment to hydrate the session from the URL hash
        await new Promise((r) => setTimeout(r, 100));

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session) {
          throw new Error(
            "No session found. Email verification may have failed.",
          );
        }

        setStatus("success");
        setMessage("Email verified ✅");
        setDetails("You can now book experiences.");

        const redirectTo = getRedirectPath();
        setTimeout(() => navigate(redirectTo, { replace: true }), 1200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verification failed.";
        setStatus("error");
        setMessage("Verification failed");
        setDetails(msg);
      }
    };

    run();
  }, [navigate]);

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-2xl px-6 md:px-8 text-center">
        <h1 className="text-2xl font-semibold">{message}</h1>

        {details ? <p className="mt-2 text-gray-600">{details}</p> : null}

        {status === "loading" && (
          <p className="mt-6 text-sm text-gray-500">Please wait…</p>
        )}

        {status === "error" && (
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => navigate("/auth", { replace: true })}>
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/", { replace: true })}
            >
              Home
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
