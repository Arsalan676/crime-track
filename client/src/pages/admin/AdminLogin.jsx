import React, { useState, useEffect } from "react";

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("adminToken");
    if (token) {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "/admin/dashboard";
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-4xl font-bold text-cyan-400 mb-2"></h1>
          <h2 className="text-2xl font-semibold text-gray-300">Admin Login</h2>
          <p className="text-gray-400 mt-2">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg transition transform hover:scale-105"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            <span className="text-cyan-400 font-bold">Note:</span> This is a
            secure admin-only area. Unauthorized access is prohibited.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Default credentials: username:{" "}
            <span className="text-gray-400">admin</span> / password:{" "}
            <span className="text-gray-400">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
