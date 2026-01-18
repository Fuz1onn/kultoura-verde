// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceInstructors from "@/pages/ServiceInstructors";
import Booking from "@/pages/Booking";
import BookingRequested from "@/pages/BookingRequested";
import Bookings from "@/pages/Bookings";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";

import RequireAuth from "@/routes/RequireAuth";
import AdminBookings from "@/pages/admin/AdminBookings";
import RequireAdmin from "@/routes/RequireAdmin";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/services/:serviceId/instructors"
          element={<ServiceInstructors />}
        />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route
            path="/booking/:serviceId/:instructorId"
            element={<Booking />}
          />
          <Route
            path="/booking/requested/:bookingId"
            element={<BookingRequested />}
          />
          <Route path="/bookings" element={<Bookings />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/bookings" element={<AdminBookings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
