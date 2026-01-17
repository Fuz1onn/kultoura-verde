// src/routes/RequireAuth.tsx (optional tiny improvement: show skeleton instead of null)
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
          <div className="mt-4 h-4 w-80 bg-gray-200 rounded-md animate-pulse" />
          <div className="mt-8 h-48 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
