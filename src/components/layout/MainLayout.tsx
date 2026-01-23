import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import BackToTop from "../ui/BackToTop";
import { Toaster } from "sonner";
import CookieNotice from "../CookieNotice";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="[--header-h:80px]">
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            className: "z-[9999]",
          }}
        />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
        <CookieNotice />
      </div>
    </div>
  );
}
