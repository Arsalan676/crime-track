import React, { useState, useEffect } from "react";

const ReportCrime = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    crimeType: "",
    customCrimeType: "",
    description: "",
    latitude: null,
    longitude: null,
    address: "",
  });

  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const crimeTypes = [
    "Theft",
    "Robbery",
    "Assault",
    "Burglary",
    "Vandalism",
    "Fraud",
    "Harassment",
    "Drug Related",
    "Domestic Violence",
    "Cybercrime",
    "Other",
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationPermission(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(
              6
            )}, Lng: ${position.coords.longitude.toFixed(6)}`,
          }));
          setLoading(false);
        },
        () => {
          alert("Unable to get location. Please enter manually.");
          setLoading(false);
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!formData.crimeType) {
      alert("Please select a crime type");
      return;
    }

    if (formData.crimeType === "Other" && !formData.customCrimeType) {
      alert("Please specify the crime type");
      return;
    }

    if (!formData.description) {
      alert("Please provide a description");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Please provide location information");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reports/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          finalCrimeType:
            formData.crimeType === "Other"
              ? formData.customCrimeType
              : formData.crimeType,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          mobileNumber: "",
          crimeType: "",
          customCrimeType: "",
          description: "",
          latitude: null,
          longitude: null,
          address: "",
        });

        alert(
          "Crime reported successfully! You will receive an SMS confirmation."
        );
      } else {
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1
                className="text-2xl font-bold text-cyan-400 cursor-pointer"
                onClick={() => (window.location.href = "/")}
              >
                CrimeTrack
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = "/")}
                className="hover:text-cyan-400 transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">
            Report a Crime
          </h2>

          {success && (
            <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
              Report submitted successfully! You will receive an SMS
              confirmation shortly.
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Crime Type <span className="text-red-500">*</span>
              </label>
              <select
                name="crimeType"
                value={formData.crimeType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
              >
                <option value="">Select Crime Type</option>
                {crimeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {formData.crimeType === "Other" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Specify Crime Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customCrimeType"
                  value={formData.customCrimeType}
                  onChange={handleInputChange}
                  placeholder="Enter crime type"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed description of the incident..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={!locationPermission || loading}
                className="w-full mb-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <span className="mr-2">⏳</span> Getting Location...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📍</span> Use Current Location
                  </>
                )}
              </button>

              {formData.latitude && formData.longitude && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                    Location Captured:
                  </p>
                  <p className="text-white font-mono text-sm">
                    {formData.address}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Or enter manually:</p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude || ""}
                    onChange={handleInputChange}
                    placeholder="Latitude"
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  />
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude || ""}
                    onChange={handleInputChange}
                    placeholder="Longitude"
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 px-4 rounded-lg text-lg transition transform hover:scale-105"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>

          <div className="mt-8 bg-gray-700 p-4 rounded-lg border border-cyan-500">
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-bold">Note:</span> All reports
              are confidential. You will receive an SMS confirmation once your
              report is submitted and another SMS when it is verified by our
              team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCrime;
