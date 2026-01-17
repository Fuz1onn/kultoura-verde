import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type LocationState = { from?: string };

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signup" && !name.trim()) return false;
    return true;
  }, [mode, name, email, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() }, // stored in user_metadata
          },
        });
        if (error) throw error;

        // If email confirmations are ON, user must confirm before session exists
        // We'll just send them home (or keep them here with a message).
        navigate(from, { replace: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-green-700 transition-colors"
        >
          ← Back to Home
        </button>

        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white border p-6 md:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Login" : "Create an account"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {mode === "login"
                ? "Log in to request a booking."
                : "Sign up to start booking cultural experiences."}
            </p>

            <div className="mt-6 grid grid-cols-2 rounded-xl border bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                    placeholder="e.g., Khalil Acebuche"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                {submitting
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login"
                    : "Create Account"}
              </Button>
            </form>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
