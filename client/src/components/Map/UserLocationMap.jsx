import React, { useEffect, useRef, useState } from "react";

const UserLocationMap = ({ onLocationSelect, initialLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(
    initialLocation || { lat: 17.385, lng: 78.4867 }
  );

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    initializeMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Geocoding function - convert address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`${API_URL}/geocoding/geocode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  // Reverse geocoding function - convert coordinates to address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(`${API_URL}/geocoding/reverse-geocode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) throw new Error("Reverse geocoding failed");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
  };

  const initializeMap = () => {
    if (!window.L || mapRef.current) return;

    const L = window.L;

    // Fix marker icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Create map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([selectedCoords.lat, selectedCoords.lng], 13);

    // Add Mapbox tiles
    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      {
        attribution: "© Mapbox © OpenStreetMap",
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19,
      }
    ).addTo(map);

    // Add draggable marker
    const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker
      .bindPopup("<b>Crime Location</b><br>Drag me or click on map!")
      .openPopup();

    // Handle marker drag
    marker.on("dragend", async (e) => {
      const position = e.target.getLatLng();
      await updateLocation(position.lat, position.lng);
    });

    // Handle map click
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await updateLocation(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  const updateLocation = async (lat, lng) => {
    setSelectedCoords({ lat, lng });
    setSearching(true);

    try {
      const result = await reverseGeocode(lat, lng);
      setAddress(result.address);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: result.address,
        });
      }

      if (markerRef.current) {
        markerRef.current
          .bindPopup(`<b>Selected Location</b><br>${result.address}`)
          .openPopup();
      }
    } catch (error) {
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackAddress);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: fallbackAddress,
        });
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) {
      alert("Please enter an address");
      return;
    }

    setSearching(true);
    try {
      const result = await geocodeAddress(address);

      setSelectedCoords({ lat: result.latitude, lng: result.longitude });
      setAddress(result.formattedAddress);

      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([result.latitude, result.longitude], 16);
        markerRef.current.setLatLng([result.latitude, result.longitude]);
        markerRef.current
          .bindPopup(`<b>Found Location</b><br>${result.formattedAddress}`)
          .openPopup();
      }

      if (onLocationSelect) {
        onLocationSelect({
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.formattedAddress,
        });
      }
    } catch (error) {
      alert(
        "Address not found. Please try a different address or click on the map."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setSelectedCoords({ lat: latitude, lng: longitude });

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }

        updateLocation(latitude, longitude);
      },
      (error) => {
        alert(
          "Unable to get your location. Please enable location services or select manually."
        );
        setSearching(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          📍 Search or Select Location <span className="text-red-500">*</span>
        </label>

        {/* Address Search */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search address (e.g., MG Road, Bangalore)"
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
            onKeyPress={(e) => e.key === "Enter" && handleAddressSearch()}
          />
          <button
            onClick={handleAddressSearch}
            disabled={searching}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            {searching ? "⏳" : "🔍"}
          </button>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          disabled={searching}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span>📍</span>
          {searching ? "Getting Location..." : "Use My Current Location"}
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full rounded-lg border-2 border-gray-600 overflow-hidden shadow-xl"
        style={{ height: "450px" }}
      />

      {/* Instructions */}
      <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
        <p className="text-sm text-gray-300 mb-2">
          <span className="text-cyan-400 font-bold">
            💡 How to select location:
          </span>
        </p>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Search for an address in the box above</li>
          <li>Click anywhere on the map to drop a pin</li>
          <li>Drag the marker to adjust the exact position</li>
          <li>Or use "Current Location" button for GPS</li>
        </ul>
      </div>

      {/* Selected Location Display */}
      {address && selectedCoords && (
        <div className="bg-cyan-900 bg-opacity-30 border border-cyan-500 p-4 rounded-lg">
          <p className="text-sm text-cyan-400 font-bold mb-1">
            ✅ Location Selected:
          </p>
          <p className="text-white text-sm mb-2">{address}</p>
          <p className="text-xs text-gray-400">
            Coordinates: {selectedCoords.lat.toFixed(6)},{" "}
            {selectedCoords.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserLocationMap;
