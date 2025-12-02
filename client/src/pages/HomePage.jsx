import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" onClick={closeMenu}>
              <h1 className="text-2xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-500 transition">
                CrimeTrack
              </h1>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-white hover:text-cyan-400 transition"
              >
                Home
              </Link>
              <Link
                to="/report-crime"
                className="text-white hover:text-cyan-400 transition"
              >
                Report
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-cyan-400 transition"
              >
                About
              </Link>

              <button
                onClick={() => navigate("/admin/login")}
                className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg transition text-white font-medium"
              >
                Login
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-white focus:outline-none focus:text-cyan-400 transition"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                // Close Icon (X)
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger Icon
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 bg-gray-900">
            <Link
              to="/"
              onClick={closeMenu}
              className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-cyan-400 rounded transition"
            >
              Home
            </Link>
            <Link
              to="/report-crime"
              onClick={closeMenu}
              className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-cyan-400 rounded transition"
            >
              Report
            </Link>
            <Link
              to="/cases"
              onClick={closeMenu}
              className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-cyan-400 rounded transition"
            >
              Cases
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-cyan-400 rounded transition"
            >
              About
            </Link>

            <button
              onClick={() => {
                closeMenu();
                navigate("/admin/login");
              }}
              className="w-full text-left px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded transition text-white font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-5xl font-bold mb-4 text-cyan-400">
            Report Crimes. Stay Safe.
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Your safety is our priority. Report incidents quickly and
            anonymously.
          </p>
          <button
            onClick={() => navigate("/report-crime")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
          >
            Report a Crime
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8">
          {/* Quick Reporting */}
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4"></div>
            <h3 className="text-2xl font-bold mb-3 text-cyan-400">
              Quick Reporting
            </h3>
            <p className="text-gray-300">
              Submit reports instantly with minimal details and stay anonymous
              if you wish.
            </p>
          </div>

          {/* Real-Time Tracking */}
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4"></div>
            <h3 className="text-2xl font-bold mb-3 text-cyan-400">
              Real-Time Tracking
            </h3>
            <p className="text-gray-300">
              Track your submitted case status and get timely updates from
              authorities.
            </p>
          </div>

          {/* Secure & Confidential */}
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4"></div>
            <h3 className="text-2xl font-bold mb-3 text-cyan-400">
              Secure & Confidential
            </h3>
            <p className="text-gray-300">
              We value your privacy. All data is encrypted and securely handled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
