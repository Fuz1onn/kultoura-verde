// src/pages/auth.tsx
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

type LocationState = { from?: string };

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Authentication failed.";
}

function getModeFromSearch(search: string): "login" | "signup" {
  const sp = new URLSearchParams(search);
  const m = sp.get("mode");
  return m === "signup" ? "signup" : "login";
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from || "/";

  const [mode, setMode] = useState<"login" | "signup">(() =>
    getModeFromSearch(location.search),
  );

  // ✅ New: success/info message (for signup verification)
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(getModeFromSearch(location.search));
  }, [location.search]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setModeInUrl = (next: "login" | "signup") => {
    const sp = new URLSearchParams(location.search);
    sp.set("mode", next);
    navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
    setError(null);
    setInfoMsg(null);
    if (next === "login") setAgree(false);
  };

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "signup" && !name.trim()) return false;
    if (mode === "signup" && !agree) return false;
    return true;
  }, [mode, name, email, password, agree]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setInfoMsg(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
        return;
      }

      // signup
      if (!agree) {
        setError("Please agree to the Terms & Privacy Policy to continue.");
        return;
      }

      const cleanEmail = email.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // ✅ If email confirmation is ON, session may be null.
      // Best UX: switch to login mode and show a "check your email" message.
      setModeInUrl("login");

      // keep their email filled for convenience
      setEmail(cleanEmail);
      setPassword(""); // optional: clear for security

      const needsEmailVerify = !data.session; // common case when confirmations enabled

      setInfoMsg(
        needsEmailVerify
          ? `We sent a verification link to ${cleanEmail}. Please verify your email, then log in.`
          : "Account created. You can now log in.",
      );
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Preserve auth mode when opening legal pages
  const termsHref = `/terms?from=${encodeURIComponent(
    location.pathname + location.search,
  )}`;
  const privacyHref = `/privacy-policy?from=${encodeURIComponent(
    location.pathname + location.search,
  )}`;

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
                onClick={() => setModeInUrl("login")}
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
                onClick={() => setModeInUrl("signup")}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* ✅ Info message (after signup) */}
            {infoMsg ? (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {infoMsg}
              </div>
            ) : null}

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
                    placeholder="e.g., John Doe"
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

              {mode === "signup" ? (
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      to={termsHref}
                      className="text-green-700 hover:underline font-medium"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to={privacyHref}
                      className="text-green-700 hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              ) : null}

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

            <p className="mt-5 text-xs text-gray-500 text-center">
              By continuing, you agree to our{" "}
              <Link to={termsHref} className="text-green-700 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to={privacyHref} className="text-green-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
