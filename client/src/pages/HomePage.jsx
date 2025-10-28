import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-16">
      {/* Hero Section */}
      <div className="relative flex flex-col justify-center items-center text-center px-4 py-16 md:py-20 mb-12 md:mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-90"></div>
        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 md:mb-8 text-cyan-400">
            Report Crimes. Stay Safe.
          </h2>
          <p className="text-lg sm:text-xl mb-10 md:mb-12 text-gray-300 max-w-2xl mx-auto">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4">⚡</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-cyan-400">
              Quick Reporting
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              Submit reports instantly with minimal details and stay anonymous
              if you wish.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4">📍</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-cyan-400">
              Real-Time Tracking
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              Track your submitted case status and get timely updates from
              authorities.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-xl hover:shadow-2xl transition">
            <div className="text-cyan-400 text-4xl mb-4">🔒</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-cyan-400">
              Secure & Confidential
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              We value your privacy. All data is encrypted and securely handled.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
