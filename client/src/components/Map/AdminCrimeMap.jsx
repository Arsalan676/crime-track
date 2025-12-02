import React, { useEffect, useRef, useState } from "react";
import reportService from "../../services/reportService";

const AdminCrimeMap = ({ report, reports }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const heatLayerRef = useRef(null);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapStyle, setMapStyle] = useState("streets");

  const MAPBOX_TOKEN =
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "http://localhost:5001/api";

  // Crime type icons and colors
  const crimeIcons = {
    Theft: "💰",
    Robbery: "🔫",
    Assault: "👊",
    Burglary: "🏠",
    Vandalism: "🔨",
    Fraud: "💳",
    Harassment: "😠",
    "Drug Related": "💊",
    "Domestic Violence": "⚠️",
    Cybercrime: "💻",
    Other: "📋",
  };

  const statusColors = {
    pending: "#EAB308",
    verified: "#22C55E",
    spam: "#EF4444",
    resolved: "#3B82F6",
  };

  useEffect(() => {
    if (report) {
      // Single report view
      initializeSingleReportMap();
    } else if (reports && reports.length > 0) {
      // Multiple reports view
      initializeMultipleReportsMap();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [report, reports]);

  const initializeSingleReportMap = () => {
    if (!window.L || !report || mapRef.current) return;

    const L = window.L;

    // Fix marker icons
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
    }).setView([report.location.latitude, report.location.longitude], 15);

    addMapTiles(map);

    // Create custom icon with emoji
    const icon = L.divIcon({
      html: `<div style="font-size: 32px;">${
        crimeIcons[report.crimeType] || "📍"
      }</div>`,
      className: "custom-crime-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Add marker
    const marker = L.marker(
      [report.location.latitude, report.location.longitude],
      { icon }
    ).addTo(map);

    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #06b6d4; font-size: 16px; font-weight: bold;">
          ${crimeIcons[report.crimeType] || "📍"} ${report.crimeType}
        </h3>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>ID:</strong> ${report._id.toString().slice(-6).toUpperCase()}
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Status:</strong> 
          <span style="background: ${
            statusColors[report.status]
          }; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
            ${report.status.toUpperCase()}
          </span>
        </p>
        <p style="margin: 4px 0; font-size: 12px;">
          <strong>Location:</strong><br>
          ${report.location.address}
        </p>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();
    mapRef.current = map;
  };

  const initializeMultipleReportsMap = async () => {
    if (!window.L || !reports || reports.length === 0 || mapRef.current) return;

    const L = window.L;

    // Fix marker icons
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Calculate center
    const lats = reports.map((r) => r.location.latitude);
    const lngs = reports.map((r) => r.location.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([centerLat, centerLng], 12);

    addMapTiles(map);

    // Add markers for each report
    const markers = [];
    reports.forEach((r) => {
      if (r.location && r.location.latitude && r.location.longitude) {
        const icon = L.divIcon({
          html: `<div style="font-size: 24px;">${
            crimeIcons[r.crimeType] || "📍"
          }</div>`,
          className: "custom-crime-icon",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker([r.location.latitude, r.location.longitude], {
          icon,
        });

        const popupContent = `
          <div style="min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; color: #06b6d4; font-size: 14px; font-weight: bold;">
              ${crimeIcons[r.crimeType] || "📍"} ${r.crimeType}
            </h3>
            <p style="margin: 4px 0; font-size: 11px;">
              <strong>ID:</strong> ${r._id.toString().slice(-6).toUpperCase()}
            </p>
            <p style="margin: 4px 0; font-size: 11px;">
              <strong>Status:</strong> 
              <span style="background: ${
                statusColors[r.status]
              }; color: white; padding: 2px 4px; border-radius: 3px; font-size: 9px;">
                ${r.status.toUpperCase()}
              </span>
            </p>
            <p style="margin: 4px 0; font-size: 11px; max-width: 200px; word-wrap: break-word;">
              ${r.location.address.substring(0, 100)}${
          r.location.address.length > 100 ? "..." : ""
        }
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        markers.push(marker);
      }
    });

    markersRef.current = markers;

    // Add heatmap
    try {
      const heatmapData = await reportService.getHeatmapData();
      if (heatmapData.heatmapData && heatmapData.heatmapData.length > 0) {
        const heatData = heatmapData.heatmapData.map((point) => [
          point.lat,
          point.lng,
          0.5,
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
        }).addTo(map);

        heatLayerRef.current = heat;
      }
    } catch (error) {
      console.error("Failed to load heatmap:", error);
    }

    mapRef.current = map;

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const addMapTiles = (map) => {
    const L = window.L;

    const styles = {
      streets: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      dark: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
    };

    L.tileLayer(styles[mapStyle] || styles.streets, {
      attribution: "© Mapbox © OpenStreetMap",
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 19,
    }).addTo(map);
  };

  const toggleHeatmap = () => {
    if (mapRef.current && heatLayerRef.current) {
      if (showHeatmap) {
        mapRef.current.removeLayer(heatLayerRef.current);
      } else {
        mapRef.current.addLayer(heatLayerRef.current);
      }
      setShowHeatmap(!showHeatmap);
    }
  };

  const changeMapStyle = (style) => {
    setMapStyle(style);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      if (report) {
        initializeSingleReportMap();
      } else if (reports) {
        initializeMultipleReportsMap();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Map Controls (for multiple reports view) */}
      {reports && reports.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => changeMapStyle("streets")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mapStyle === "streets"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => changeMapStyle("dark")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mapStyle === "dark"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => changeMapStyle("satellite")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mapStyle === "satellite"
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Satellite
          </button>

          {heatLayerRef.current && (
            <button
              onClick={toggleHeatmap}
              className="px-4 py-2 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition"
            >
              {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
            </button>
          )}
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full rounded-lg border-2 border-gray-600 overflow-hidden shadow-xl"
        style={{ height: report ? "350px" : "500px" }}
      />

      {/* Legend (for multiple reports) */}
      {reports && reports.length > 0 && (
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-bold text-cyan-400 mb-2">Map Legend:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize text-gray-300">{status}</span>
              </div>
            ))}
          </div>
          {showHeatmap && heatLayerRef.current && (
            <p className="text-xs text-gray-400 mt-3">
              <span className="font-bold">Heatmap:</span> Red/Orange = High
              crime density, Blue/Green = Low density
            </p>
          )}
        </div>
      )}

      {/* Single Report Info */}
      {report && (
        <div className="bg-gray-700 p-4 rounded-lg border border-cyan-500">
          <p className="text-sm text-cyan-400 font-bold mb-2">
            📍 Crime Location Details:
          </p>
          <p className="text-white text-sm mb-2">{report.location.address}</p>
          <p className="text-xs text-gray-400">
            Coordinates: {report.location.latitude.toFixed(6)},{" "}
            {report.location.longitude.toFixed(6)}
          </p>
          <button
            onClick={() => {
              window.open(
                `https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`,
                "_blank"
              );
            }}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Open in Google Maps
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCrimeMap;
