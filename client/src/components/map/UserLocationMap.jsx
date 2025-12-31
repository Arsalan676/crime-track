import React, { useEffect, useRef, useState } from "react";
import "leaflet.heat";

const UserLocationMap = ({
  onLocationSelect,
  initialLocation,
  showHeatmap = false,
  enableHeatmapToggle = false,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const heatLayerRef = useRef(null);
  const heatmapLoadedRef = useRef(false); // NEW: Track if heatmap data is loaded

  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(
    initialLocation || { lat: 17.385, lng: 78.4867 }
  );
  const [heatmapVisible, setHeatmapVisible] = useState(showHeatmap);

  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const init = async () => {
      if (!mapRef.current) {
        initializeMap();

        // Load heatmap after map is initialized
        if (showHeatmap && !heatmapLoadedRef.current) {
          // Wait a bit for map to be fully ready
          setTimeout(() => {
            if (mapRef.current && !heatmapLoadedRef.current) {
              console.log("Loading heatmap data");
              loadHeatmapData();
            }
          }, 500);
        }
      }
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      heatLayerRef.current = null;
      heatmapLoadedRef.current = false;
    };
  }, []);

  // Load heatmap only ONCE when map is ready
  useEffect(() => {
    if (mapRef.current && showHeatmap && !heatmapLoadedRef.current) {
      console.log("Loading heatmap data (first time only)");
      loadHeatmapData();
    }
  }, [mapRef.current, showHeatmap]);

  const loadHeatmapData = async () => {
    // Triple check to prevent duplicates
    if (!mapRef.current || !window.L || heatmapLoadedRef.current) {
      console.log("Skipping heatmap load - already loaded or map not ready");
      return;
    }

    // Set flag immediately to prevent race conditions
    heatmapLoadedRef.current = true;

    try {
      const response = await fetch(`${API_BASE_URL}/reports/heatmap-data`);
      const data = await response.json();

      console.log("Heatmap data received:", data);

      if (data.heatmapData && data.heatmapData.length > 0) {
        const L = window.L;

        const heatData = data.heatmapData.map((point) => [
          point.lat,
          point.lng,
          1.0,
        ]);

        console.log("Creating heatmap with", heatData.length, "points");

        const heat = L.heatLayer(heatData, {
          radius: 50,
          blur: 50,
          maxZoom: 19,
          minOpacity: 0.6,
          gradient: {
            0.0: "blue",
            0.3: "lime",
            0.5: "yellow",
            0.7: "orange",
            1.0: "red",
          },
        });

        heatLayerRef.current = heat;

        if (heatmapVisible) {
          heat.addTo(mapRef.current);
          console.log("Heatmap added to map (visible by default)");
        } else {
          console.log("Heatmap created but hidden");
        }
      }
    } catch (error) {
      console.error("Failed to load heatmap:", error);
      heatmapLoadedRef.current = false; // Reset on error
    }
  };

  const toggleHeatmap = () => {
    console.log("Toggle clicked. Current visible:", heatmapVisible);
    console.log("HeatLayer ref exists?", !!heatLayerRef.current);
    console.log("Map ref exists?", !!mapRef.current);

    if (!heatLayerRef.current || !mapRef.current) {
      console.log("ERROR: No heatmap layer or map found");
      return;
    }

    try {
      if (heatmapVisible) {
        // Hide heatmap
        if (mapRef.current.hasLayer(heatLayerRef.current)) {
          mapRef.current.removeLayer(heatLayerRef.current);
          console.log("Heatmap removed from map");
        } else {
          console.log("Heatmap was not on map");
        }
      } else {
        // Show heatmap
        if (!mapRef.current.hasLayer(heatLayerRef.current)) {
          heatLayerRef.current.addTo(mapRef.current);
          console.log("Heatmap added to map");
        } else {
          console.log("Heatmap was already on map");
        }
      }

      setHeatmapVisible(!heatmapVisible);
    } catch (error) {
      console.error("Error toggling heatmap:", error);
    }
  };

  const initializeMap = () => {
    console.log("=== UserLocationMap INIT ===");

    if (!window.L || mapRef.current) return;

    const L = window.L;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([selectedCoords.lat, selectedCoords.lng], 13);

    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`,
      {
        attribution: "© Mapbox © OpenStreetMap",
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19,
      }
    ).addTo(map);

    const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker
      .bindPopup("<b>Crime Location</b><br>Drag me or click on map!")
      .openPopup();

    marker.on("dragend", async (e) => {
      const position = e.target.getLatLng();
      await updateLocation(position.lat, position.lng);
    });

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await updateLocation(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`${API_BASE_URL}/geocoding/geocode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) throw new Error("Geocoding failed");
      return await response.json();
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/geocoding/reverse-geocode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        }
      );

      if (!response.ok) throw new Error("Reverse geocoding failed");
      return await response.json();
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
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
      <div>
        <label className="block text-sm font-medium mb-2">
          Search or Select Location <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search address (e.g., Gachibowli, Hyderabad)"
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white"
            onKeyPress={(e) => e.key === "Enter" && handleAddressSearch()}
          />
          <button
            onClick={handleAddressSearch}
            disabled={searching}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-lg transition"
          >
            {searching ? <span>&#x21BB;</span> : "🔍"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCurrentLocation}
            disabled={searching}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>📍</span>
            {searching ? "Getting Location..." : "Use My Current Location"}
          </button>

          {enableHeatmapToggle && (
            <button
              onClick={toggleHeatmap}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              {heatmapVisible ? "Hide" : "Show"} Heatmap
            </button>
          )}
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="w-full rounded-lg border-2 border-gray-600 overflow-hidden shadow-xl"
        style={{ height: "450px" }}
      />

      <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
        <p className="text-sm text-gray-300 mb-2">
          <span className="text-cyan-400 font-bold">
            How to select location:
          </span>
        </p>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Search for an address in the box above</li>
          <li>Click anywhere on the map to drop a pin</li>
          <li>Drag the marker to adjust the exact position</li>
          <li>Or use "Current Location" button for GPS</li>
        </ul>
      </div>

      {heatmapVisible && enableHeatmapToggle && (
        <div className="bg-orange-900 bg-opacity-30 border border-orange-500 p-3 rounded-lg">
          <p className="text-sm text-orange-200">
            <span className="font-bold">Crime Heatmap:</span> Red/orange areas
            show higher crime density. Use this to understand crime patterns in
            your area.
          </p>
        </div>
      )}

      {address && selectedCoords && (
        <div className="bg-cyan-900 bg-opacity-30 border border-cyan-500 p-4 rounded-lg">
          <p className="text-sm text-cyan-400 font-bold mb-1">
            Selected Location:
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
