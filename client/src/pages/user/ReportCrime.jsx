import React, { useState, useEffect, useRef } from "react";
import authService from "../../services/authService.js";
import reportService from "../../services/reportService.js";
import UserLocationMap from "../../components/map/UserLocationMap";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ReportCrimePage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);
  const [verifiedMobile, setVerifiedMobile] = useState("");

  const [formData, setFormData] = useState({
    mobileNumber: "",
    crimeType: "",
    customCrimeType: "",
    description: "",
    latitude: null,
    longitude: null,
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Map state
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [heatLayer, setHeatLayer] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const mapContainerRef = useRef(null);

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
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (isVerified && !checkingVerification) {
      initializeMap();
    }
  }, [isVerified, checkingVerification]);

  const checkVerificationStatus = async () => {
    const storedMobile = localStorage.getItem("verifiedMobile");

    if (storedMobile) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/users/check-verification/${storedMobile}`
        );
        const data = await response.json();

        if (data.isVerified) {
          setIsVerified(true);
          setVerifiedMobile(storedMobile);
          setFormData((prev) => ({ ...prev, mobileNumber: storedMobile }));
        } else {
          localStorage.removeItem("verifiedMobile");
        }
      } catch (err) {
        console.error("Verification check failed:", err);
      }
    }

    setCheckingVerification(false);
  };

  const initializeMap = () => {
    if (!window.L || !mapContainerRef.current || map) return;

    const L = window.L;

    const mapInstance = L.map(mapContainerRef.current).setView(
      [17.385, 78.4867],
      13
    );

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution: "© Mapbox © OpenStreetMap",
        maxZoom: 19,
        id: "mapbox/streets-v12",
        accessToken: MAPBOX_ACCESS_TOKEN,
      }
    ).addTo(mapInstance);

    const markerInstance = L.marker([17.385, 78.4867], {
      draggable: true,
    }).addTo(mapInstance);

    markerInstance
      .bindPopup("Click on map or drag me to select location")
      .openPopup();

    markerInstance.on("dragend", async (e) => {
      const position = e.target.getLatLng();
      handleLocationChange(position.lat, position.lng);
    });

    mapInstance.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      markerInstance.setLatLng([lat, lng]);
      handleLocationChange(lat, lng);
    });

    setMap(mapInstance);
    setMarker(markerInstance);
    loadHeatmapData(mapInstance, L);
  };

  const loadHeatmapData = async (mapInstance, L) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/reports/heatmap-data"
      );
      const data = await response.json();

      if (data.heatmapData && data.heatmapData.length > 0) {
        const heatData = data.heatmapData.map((point) => [
          point.lat,
          point.lng,
          point.intensity || 0.5,
        ]);

        const heat = L.heatLayer(heatData, {
          radius: 25,
          blur: 35,
          maxZoom: 17,
          gradient: {
            0.0: "blue",
            0.3: "lime",
            0.5: "yellow",
            0.7: "orange",
            1.0: "red",
          },
        }).addTo(mapInstance);

        setHeatLayer(heat);
      }
    } catch (error) {
      console.error("Failed to load heatmap data:", error);
    }
  };

  const handleLocationChange = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/api/geocoding/reverse-geocode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: data.address,
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.address.trim()) {
      alert("Please enter an address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/api/geocoding/geocode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: formData.address }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const { latitude, longitude, formattedAddress } = data;

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: formattedAddress,
        }));

        if (map && marker) {
          map.setView([latitude, longitude], 15);
          marker.setLatLng([latitude, longitude]);
        }
      } else {
        alert("Address not found. Please try a different address.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Failed to search address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (map && marker) {
          map.setView([lat, lng], 15);
          marker.setLatLng([lat, lng]);
        }

        handleLocationChange(lat, lng);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enable location services.");
        setLoading(false);
      }
    );
  };

  const toggleHeatmap = () => {
    if (map && heatLayer) {
      if (showHeatmap) {
        map.removeLayer(heatLayer);
      } else {
        map.addLayer(heatLayer);
      }
      setShowHeatmap(!showHeatmap);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!formData.crimeType) {
      setError("Please select a crime type");
      return;
    }

    if (formData.crimeType === "Other" && !formData.customCrimeType) {
      setError("Please specify the crime type");
      return;
    }

    if (!formData.description) {
      setError("Please provide a description");
      return;
    }

    if (!formData.address || !formData.latitude || !formData.longitude) {
      setError("Please select a location on the map or search for an address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/reports/create", {
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

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          mobileNumber: verifiedMobile,
          crimeType: "",
          customCrimeType: "",
          description: "",
          latitude: null,
          longitude: null,
          address: "",
        });

        setError("");
        alert(
          `Crime reported successfully! Report ID: ${data.shortId}\n\nYou will receive an SMS confirmation shortly.`
        );

        if (map && marker) {
          marker.setLatLng([12.9716, 77.5946]);
          map.setView([12.9716, 77.5946], 13);
        }
      } else {
        if (response.status === 403) {
          setError(
            "Your mobile number is not verified. Redirecting to verification..."
          );
          setTimeout(() => {
            window.location.href = "/verify";
          }, 2000);
        } else if (response.status === 429) {
          setError(data.message || "Rate limit exceeded");
        } else {
          setError(data.error || "Failed to submit report. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("verifiedMobile");
    window.location.href = "/verify";
  };

  if (checkingVerification) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Checking verification status...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-cyan-400">CrimeTrack</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Verification Required
            </h2>
            <p className="text-gray-300 mb-8">
              You need to verify your mobile number with OTP before reporting a
              crime.
            </p>
            <button
              onClick={() => (window.location.href = "/verify")}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition transform hover:scale-105"
            >
              Verify Mobile Number
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1
              className="text-2xl font-bold text-cyan-400 cursor-pointer"
              onClick={() => (window.location.href = "/")}
            >
              CrimeTrack
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">📱 {verifiedMobile}</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Logout
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
              Report submitted successfully! Check your SMS for confirmation.
            </div>
          )}

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
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
                Location Address <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address or select on map"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
                  onKeyPress={(e) => e.key === "Enter" && handleAddressSearch()}
                />
                <button
                  onClick={handleAddressSearch}
                  disabled={loading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                  {loading ? "⏳" : "🔍"}
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCurrentLocation}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>📍</span> Current Location
                </button>

                <button
                  onClick={toggleHeatmap}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition"
                >
                  {showHeatmap ? " Hide" : " Show"} Heatmap
                </button>
              </div>

              <div
                ref={mapContainerRef}
                className="w-full rounded-lg border-2 border-gray-600 overflow-hidden mb-4"
                style={{ height: "400px" }}
              />

              {formData.address && (
                <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
                  <p className="text-sm text-cyan-400 font-bold mb-1">
                    Selected Location:
                  </p>
                  <p className="text-white text-sm">{formData.address}</p>
                </div>
              )}

              <div className="bg-gray-700 p-4 rounded-lg mt-4">
                <p className="text-xs text-gray-300">
                  <span className="font-bold">Tip:</span> Click anywhere on the
                  map, drag the marker, search for an address, or use your
                  current location.
                </p>
              </div>

              {showHeatmap && (
                <div className="bg-orange-900 bg-opacity-30 border border-orange-500 p-3 rounded-lg mt-4">
                  <p className="text-sm text-orange-200">
                    <span className="font-bold">Crime Heatmap:</span> Red/orange
                    areas show higher crime density. Use this to understand
                    crime patterns in your area.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 rounded-lg text-lg transition transform hover:scale-105"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>

          <div className="mt-8 bg-gray-700 p-4 rounded-lg border border-cyan-500">
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-bold">Note:</span> All reports
              are confidential. You will receive SMS confirmations for report
              submission and verification status updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCrimePage;
