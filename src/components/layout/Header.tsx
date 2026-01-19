// src/components/layout/Header.tsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { isCurrentUserAdmin } from "@/lib/admin";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  const isHome = location.pathname === "/";
  const shouldBeSolid = !isHome || scrolled || menuOpen;

  // Scroll behavior (home only)
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", onScroll as unknown as EventListener);
    return () =>
      window.removeEventListener(
        "scroll",
        onScroll as unknown as EventListener,
      );
  }, [isHome]);

  // ✅ Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Admin check
  useEffect(() => {
    const run = async () => {
      if (!user || loading) {
        setIsAdmin(false);
        return;
      }
      try {
        const ok = await isCurrentUserAdmin();
        setIsAdmin(ok);
      } catch {
        setIsAdmin(false);
      }
    };
    run();
  }, [user, loading]);

  const loginWithReturn = () => {
    const from = location.pathname + location.search;
    localStorage.setItem("kv_post_auth_redirect", from);
    navigate("/auth", { state: { from } });
  };

  const logout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const roleBadgeClass = useMemo(() => {
    if (!user || loading) return "";
    const base = "rounded-full px-3 py-1 text-xs font-semibold";
    if (!shouldBeSolid) {
      return `${base} ${isAdmin ? "bg-white/20 text-white" : "bg-white/10 text-white/90"}`;
    }
    return `${base} ${isAdmin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`;
  }, [user, loading, shouldBeSolid, isAdmin]);

  const mobilePanelBg = shouldBeSolid ? "bg-white" : "bg-green-700";
  const mobileText = shouldBeSolid ? "text-gray-800" : "text-white";

  // ✅ Sticky active link highlight (desktop + mobile)
  const linkClass = (isActive: boolean) =>
    [
      "relative inline-flex items-center transition-colors",
      // active underline + color
      isActive
        ? shouldBeSolid
          ? "text-green-700"
          : "text-white"
        : shouldBeSolid
          ? "text-gray-700 hover:text-green-600"
          : "text-white/90 hover:text-white",
    ].join(" ");

  const activeUnderline = (isActive: boolean) =>
    [
      "absolute -bottom-2 left-0 h-0.5 rounded-full transition-all duration-200",
      shouldBeSolid ? "bg-green-600" : "bg-white",
      isActive ? "w-full opacity-100" : "w-0 opacity-0",
    ].join(" ");

  const mobileItemClass = (isActive: boolean) =>
    [
      "flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium border transition",
      isActive
        ? shouldBeSolid
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-white/15 border-white/20 text-white"
        : shouldBeSolid
          ? "bg-white border-gray-200 text-gray-800 hover:border-green-300 hover:bg-gray-50"
          : "bg-white/10 border-white/15 text-white hover:bg-white/15",
    ].join(" ");

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        shouldBeSolid ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
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
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <span className="relative">
                Home
                <span className={activeUnderline(isActive)} />
              </span>
            )}
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) => linkClass(isActive)}
          >
            {({ isActive }) => (
              <span className="relative">
                Services
                <span className={activeUnderline(isActive)} />
              </span>
            )}
          </NavLink>

          {user && !loading ? (
            <>
              <NavLink
                to="/bookings"
                className={({ isActive }) => linkClass(isActive)}
              >
                {({ isActive }) => (
                  <span className="relative">
                    My Bookings
                    <span className={activeUnderline(isActive)} />
                  </span>
                )}
              </NavLink>

              {isAdmin ? (
                <NavLink
                  to="/admin/bookings"
                  className={({ isActive }) => linkClass(isActive)}
                >
                  {({ isActive }) => (
                    <span className="relative">
                      Admin
                      <span className={activeUnderline(isActive)} />
                    </span>
                  )}
                </NavLink>
              ) : null}
            </>
          ) : null}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <>
              <div className="h-9 w-20 rounded-md bg-gray-200 animate-pulse" />
              <div className="h-9 w-20 rounded-md bg-gray-200 animate-pulse" />
            </>
          ) : user ? (
            <>
              <span className={roleBadgeClass}>
                {isAdmin ? "Admin" : "User"}
              </span>
              <Button
                onClick={logout}
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

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={`md:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 transition ${
            shouldBeSolid
              ? "border-gray-200 text-gray-800 hover:bg-gray-50"
              : "border-white/20 text-white hover:bg-white/10"
          }`}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ✅ Mobile menu (slide + better UI) */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          menuOpen ? "max-h-130 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`${mobilePanelBg} px-6 pb-6`}>
          {/* Top row: role + actions */}
          <div className="pt-2 flex items-center justify-between">
            {user && !loading ? (
              <span className={roleBadgeClass}>
                {isAdmin ? "Admin" : "User"}
              </span>
            ) : (
              <span className={`text-xs ${mobileText}/80`}> </span>
            )}

            {loading ? (
              <div className="h-9 w-24 rounded-md bg-gray-200 animate-pulse" />
            ) : user ? (
              <Button
                onClick={logout}
                size="sm"
                className={
                  shouldBeSolid
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white text-green-700 hover:bg-gray-100"
                }
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={loginWithReturn}
                size="sm"
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

          {/* Links */}
          <div className="mt-4 grid gap-2">
            <NavLink
              to="/"
              className={({ isActive }) => mobileItemClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <span>Home</span>
                  {isActive ? (
                    <span
                      className={`text-xs ${shouldBeSolid ? "text-green-700" : "text-white/90"}`}
                    >
                      Active
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) => mobileItemClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  <span>Services</span>
                  {isActive ? (
                    <span
                      className={`text-xs ${shouldBeSolid ? "text-green-700" : "text-white/90"}`}
                    >
                      Active
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>

            {user && !loading ? (
              <>
                <NavLink
                  to="/bookings"
                  className={({ isActive }) => mobileItemClass(isActive)}
                >
                  {({ isActive }) => (
                    <>
                      <span>My Bookings</span>
                      {isActive ? (
                        <span
                          className={`text-xs ${shouldBeSolid ? "text-green-700" : "text-white/90"}`}
                        >
                          Active
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>

                {isAdmin ? (
                  <NavLink
                    to="/admin/bookings"
                    className={({ isActive }) => mobileItemClass(isActive)}
                  >
                    {({ isActive }) => (
                      <>
                        <span>Admin</span>
                        {isActive ? (
                          <span
                            className={`text-xs ${
                              shouldBeSolid ? "text-green-700" : "text-white/90"
                            }`}
                          >
                            Active
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
