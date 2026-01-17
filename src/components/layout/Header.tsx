import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${scrolled ? "bg-white shadow-sm" : "bg-transparent"}
      `}
    >
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={scrolled ? "/images/logo-green.svg" : "/images/logo-white.svg"}
            alt="Kultoura Verde"
            className="h-40 w-auto transition-all duration-300"
          />
          <span
            className={`font-semibold text-lg transition-colors
              ${scrolled ? "text-green-700" : "text-white"}
            `}
          ></span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-green-600"
                  : "text-white/90 hover:text-white"
              } ${isActive ? "font-semibold" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) =>
              `transition-colors ${
                scrolled
                  ? "text-gray-700 hover:text-green-600"
                  : "text-white/90 hover:text-white"
              } ${isActive ? "font-semibold" : ""}`
            }
          >
            Services
          </NavLink>

          <NavLink
            to="/contact"
            className={`transition-colors ${
              scrolled
                ? "text-gray-700 hover:text-green-600"
                : "text-white/90 hover:text-white"
            }`}
          >
            Contact Us
          </NavLink>
        </nav>

        {/* Login */}
        <Button
          variant="ghost"
          className={
            scrolled
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
