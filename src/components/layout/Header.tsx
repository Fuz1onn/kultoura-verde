import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
        <div className="flex items-center gap-2 font-bold text-lg">
          <img
            src={scrolled ? "/images/logo-green.svg" : "/images/logo-white.svg"}
            alt="Kultoura Verde"
            className="h-48 transition-opacity duration-300"
          />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {["Home", "Services", "Contact Us"].map((item) => (
            <a
              key={item}
              href="#"
              className={`transition-colors
                ${
                  scrolled
                    ? "text-gray-700 hover:text-green-600"
                    : "text-white/90 hover:text-white"
                }
              `}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Login */}
        <Button
          variant={scrolled ? "default" : "secondary"}
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
