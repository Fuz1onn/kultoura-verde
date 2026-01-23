// src/components/CookieNotice.tsx
import { useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "kv_cookie_notice_ack_v1";

function getInitialOpen() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

export default function CookieNotice() {
  const [open, setOpen] = useState<boolean>(() => getInitialOpen());

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              {/* Left content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Cookies & Privacy
                </p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  We use essential cookies/local storage to keep you signed in
                  and make bookings work properly. Learn more in our{" "}
                  <Link
                    to="/privacy-policy"
                    className="font-medium text-green-700 hover:underline"
                    onClick={dismiss}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss cookie notice"
                className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/privacy-policy"
                onClick={dismiss}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                View policy
              </Link>

              <button
                type="button"
                onClick={dismiss}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition whitespace-nowrap"
              >
                Got it
              </button>
            </div>
          </div>
        </div>

        {/* Optional: small spacing from bottom safe-area on mobile */}
        <div className="h-2" />
      </div>
    </div>
  );
}
