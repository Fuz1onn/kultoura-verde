import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const shouldBeSolid = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${shouldBeSolid ? "bg-white shadow-sm" : "bg-transparent"}
      `}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={
              shouldBeSolid
                ? "/images/logo-green.svg"
                : "/images/logo-white.svg"
            }
            alt="Kultoura Verde"
            className="h-40 w-auto transition-all duration-300"
          />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink
            to="/"
            className={`transition-colors ${
              shouldBeSolid
                ? "text-gray-700 hover:text-green-600"
                : "text-white/90 hover:text-white"
            }`}
          >
            Home
          </NavLink>

          <NavLink
            to="/services"
            className={`transition-colors ${
              shouldBeSolid
                ? "text-gray-700 hover:text-green-600"
                : "text-white/90 hover:text-white"
            }`}
          >
            Services
          </NavLink>

          <button
            type="button"
            onClick={() => {
              if (isHome) {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/", { state: { scrollTo: "contact" } });
              }
            }}
            className={`transition-colors ${
              shouldBeSolid
                ? "text-gray-700 hover:text-green-600"
                : "text-white/90 hover:text-white"
            }`}
          >
            Contact Us
          </button>
        </nav>

        {/* Login */}
        <Button
          className={
            shouldBeSolid
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-white text-green-700 hover:bg-gray-100"
          }
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;
