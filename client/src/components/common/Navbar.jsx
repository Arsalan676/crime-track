import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-gray-800 shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={closeMenu}>
            <h1 className="text-2xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-500 transition">
              CrimeTrack
            </h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-cyan-400 transition">
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
            <Link
              to="/contact"
              className="text-white hover:text-cyan-400 transition"
            >
              Contact
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
          <Link
            to="/contact"
            onClick={closeMenu}
            className="block px-4 py-2 text-white hover:bg-gray-700 hover:text-cyan-400 rounded transition"
          >
            Contact
          </Link>
          <button
            onClick={() => {
              closeMenu();
              navigate("/login");
            }}
            className="w-full text-left px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded transition text-white font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
