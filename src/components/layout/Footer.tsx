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

        {/* Links */}
        <div>
          <h4 className="text-white font-medium">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Services</li>
            <li>Instructors</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-medium">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
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
