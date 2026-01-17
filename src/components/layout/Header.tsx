// src/components/layout/Header.tsx
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const isHome = location.pathname === "/";
  const shouldBeSolid = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const loginWithReturn = () => {
    const from = location.pathname + location.search;
    navigate("/auth", { state: { from } });
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300
        ${shouldBeSolid ? "bg-white shadow-sm" : "bg-transparent"}
      `}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
          <img
            src={shouldBeSolid ? "/images/logo-green.svg" : "/images/logo-white.svg"}
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

          {/* Optional: show My Bookings in nav when authed */}
          {user && !loading ? (
            <NavLink
              to="/bookings"
              className={`transition-colors ${
                shouldBeSolid
                  ? "text-gray-700 hover:text-green-600"
                  : "text-white/90 hover:text-white"
              }`}
            >
              My Bookings
            </NavLink>
          ) : null}
        </nav>

        {/* Right side: loading skeleton / login / my bookings + logout */}
        <div className="flex items-center gap-3">
          {loading ? (
            <>
              <div className="h-9 w-24 rounded-md bg-gray-200 animate-pulse" />
              <div className="h-9 w-20 rounded-md bg-gray-200 animate-pulse" />
            </>
          ) : user ? (
            <>
              <Button
                onClick={() => navigate("/bookings")}
                variant="outline"
                className={
                  shouldBeSolid
                    ? "border-gray-300 text-gray-800 hover:bg-gray-50"
                    : "border-white/40 text-white hover:bg-white/10"
                }
              >
                My Bookings
              </Button>

              <Button
                onClick={async () => {
                  await signOut();
                  navigate("/", { replace: true });
                }}
                className={
                  shouldBeSolid
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-green-700 hover:bg-gray-100"
                }
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={loginWithReturn}
              className={
                shouldBeSolid
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-green-700 hover:bg-gray-100"
              }
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
