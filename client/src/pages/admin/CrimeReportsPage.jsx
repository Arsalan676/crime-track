import React, { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import authService from "../../services/authService";
import AdminCrimeMap from "../../components/Map/AdminCrimeMap";

const CrimeReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  const crimeTypes = [
    "All Types",
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

  useEffect(() => {
    if (!authService.isAdminLoggedIn()) {
      window.location.href = "/admin/login";
      return;
    }
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await adminService.getReports();
      setReports(data.reports || []);
    } catch (err) {
      if (err.response?.status === 401) {
        authService.adminLogout();
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      await adminService.verifyReport(selectedReport._id, status, adminNotes);
      alert(`Report marked as ${status}! User has been notified via SMS.`);
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (err) {
      alert("Failed to update report");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const statusColors = {
    pending: "bg-yellow-600",
    verified: "bg-green-600",
    spam: "bg-red-600",
    resolved: "bg-blue-600",
  };

  const filteredReports = reports.filter((r) => {
    const matchesStatus = filter === "all" || r.status === filter;
    const matchesType =
      crimeTypeFilter === "all" || r.crimeType === crimeTypeFilter;
    const matchesSearch =
      !search ||
      r.crimeType.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.address?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-cyan-400 cursor-pointer"
            onClick={() => (window.location.href = "/admin/dashboard")}
          >
            CrimeTrack Admin
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => (window.location.href = "/admin/dashboard")}
              className="hover:text-cyan-400"
            >
              Dashboard
            </button>
            <button
              onClick={() => authService.adminLogout()}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2">Crime Reports</h2>
            <p className="text-gray-400">View and manage all crime reports</p>
          </div>
          <button
            onClick={() => setShowMapView(!showMapView)}
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-bold transition flex items-center gap-2"
          >
            {showMapView ? "Card View" : "Map View"}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="spam">Spam</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">Crime Type</label>
              <select
                value={crimeTypeFilter}
                onChange={(e) => setCrimeTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              >
                {crimeTypes.map((t, i) => (
                  <option key={t} value={i === 0 ? "all" : t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
            <button
              onClick={fetchReports}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <span>&#x21BB;</span> Refresh
            </button>
          </div>
        </div>

        {/* Map View */}
        {showMapView ? (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">
              Crime Locations Map
            </h3>
            <AdminCrimeMap reports={filteredReports} />
          </div>
        ) : /* Cards Grid */
        filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No Reports Found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition"
              >
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {crimeIcons[report.crimeType] || "📋"}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">{report.crimeType}</h3>
                      <p className="text-sm text-cyan-100">
                        ID: {report._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[report.status]
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white line-clamp-2">
                      {report.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-400">📍 Location</p>
                    <p className="text-white text-sm line-clamp-2">
                      {report.location?.address}
                    </p>
                  </div>

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-400">Reported</p>
                    <p className="text-white text-sm">
                      {formatDate(report.reportedAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNotes(report.adminNotes || "");
                    }}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 py-3 rounded-lg font-bold transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">
                    {crimeIcons[selectedReport.crimeType] || "📋"}
                  </span>
                  <div>
                    <h3 className="text-3xl font-bold text-cyan-400">
                      {selectedReport.crimeType}
                    </h3>
                    <p className="text-gray-400">
                      ID: {selectedReport._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-4xl text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        statusColors[selectedReport.status]
                      }`}
                    >
                      {selectedReport.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Reported</p>
                    <p className="text-lg">
                      {formatDate(selectedReport.reportedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Contact</p>
                    <p className="text-lg">{selectedReport.mobileNumber}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <div className="bg-gray-700 p-4 rounded-lg h-48 overflow-y-auto">
                    <p>{selectedReport.description}</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mb-6">
                <AdminCrimeMap report={selectedReport} />
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none"
                />
              </div>

              {/* Action Buttons */}
              {selectedReport.status === "pending" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerify("verified")}
                    disabled={processing}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold"
                  >
                    {processing ? "Processing..." : "Verify"}
                  </button>
                  <button
                    onClick={() => handleVerify("spam")}
                    disabled={processing}
                    className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold"
                  >
                    {processing ? "Processing..." : "Spam"}
                  </button>
                </div>
              )}
              {selectedReport.status === "verified" && (
                <button
                  onClick={() => handleVerify("resolved")}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold"
                >
                  {processing ? "Processing..." : "Resolve"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeReportsPage;
