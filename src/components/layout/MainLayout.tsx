import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "../ui/BackToTop";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="[--header-h:80px]">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </div>
  );
}
