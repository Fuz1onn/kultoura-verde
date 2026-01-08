import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
            KV
          </div>
          <span className="text-xl font-semibold tracking-wide">
            Kultoura Verde
          </span>
        </div>

        {/* Navigation */}
        <ul className="hidden md:flex items-center gap-8 text-lg font-medium">
          <li className="hover:text-green-400 transition">Home</li>
          <li className="hover:text-green-400 transition">Services</li>
          <li className="hover:text-green-400 transition">Contact Us</li>
        </ul>

        {/* Login Button */}
        <Button
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-black"
        >
          Login
        </Button>
      </nav>
    </header>
  );
};

export default Header;
