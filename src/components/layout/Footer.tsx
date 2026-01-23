// src/components/Footer.tsx
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <h3 className="text-white text-lg font-semibold">Kultoura Verde</h3>
          <p className="mt-4 text-sm text-gray-400">
            Connecting people through authentic cultural craftsmanship
            experiences.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-white font-medium">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/services" className="hover:text-green-500 transition">
                Services
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-green-500 transition">
                My Bookings
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-medium">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/terms" className="hover:text-green-500 transition">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-green-500 transition"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Kultoura Verde. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
