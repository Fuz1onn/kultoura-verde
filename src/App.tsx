import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceInstructors from "@/pages/ServiceInstructors";
import Booking from "@/pages/Booking";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/services/:serviceId/instructors"
          element={<ServiceInstructors />}
        />
        <Route path="/booking/:serviceId/:instructorId" element={<Booking />} />
      </Route>
    </Routes>
  );
}
