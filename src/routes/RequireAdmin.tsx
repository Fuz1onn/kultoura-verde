// src/routes/RequireAdmin.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isCurrentUserAdmin } from "@/lib/admin";

export default function RequireAdmin() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const ok = await isCurrentUserAdmin();
        setIsAdmin(ok);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 text-gray-900 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <div className="rounded-2xl bg-white border p-8">
            <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-72 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
