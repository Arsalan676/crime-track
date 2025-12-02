import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    spamReports: 0,
  });
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingReport, setProcessingReport] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "http://localhost:5001/api/admin/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5001/api/admin/reports?status=${filterStatus}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setAdminNotes("");
  };

  const handleVerifyReport = async (status) => {
    if (!selectedReport) return;

    if (
      !window.confirm(
        `Are you sure you want to mark this report as ${status.toUpperCase()}?`
      )
    ) {
      return;
    }

    setProcessingReport(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `http://localhost:5001/api/admin/reports/${selectedReport._id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            adminNotes,
          }),
        }
      );

      if (response.ok) {
        alert(`Report ${status} successfully! User has been notified via SMS.`);
        closeModal();
        fetchDashboardData();
        fetchReports();
      } else {
        alert("Failed to update report. Please try again.");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setProcessingReport(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-600 text-white",
      verified: "bg-green-600 text-white",
      spam: "bg-red-600 text-white",
      resolved: "bg-blue-600 text-white",
    };
    return badges[status] || "bg-gray-600 text-white";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-cyan-400">
                CrimeTrack Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = "/admin/reports")}
                className="hover:text-cyan-400 transition"
              >
                All Reports
              </button>
              <span className="text-sm text-gray-400">Admin Panel</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Reports</p>
                <p className="text-4xl font-bold mt-2">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Pending</p>
                <p className="text-4xl font-bold mt-2">
                  {stats.pendingReports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Verified</p>
                <p className="text-4xl font-bold mt-2">
                  {stats.verifiedReports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Spam</p>
                <p className="text-4xl font-bold mt-2">{stats.spamReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Crime Reports</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("verified")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "verified"
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setFilterStatus("spam")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "spam"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Spam
              </button>
              <button
                onClick={() => setFilterStatus("resolved")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "resolved"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl">No {filterStatus} reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Crime Type</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Reported</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr
                      key={report._id}
                      className="border-b border-gray-700 hover:bg-gray-750"
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        {report._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {report.crimeType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300 max-w-xs truncate">
                        {report.location.address}
                      </td>
                      <td className="py-3 px-4">{report.mobileNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {formatDate(report.reportedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openReportModal(report)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-cyan-400">
                    Report Details
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    ID: {selectedReport._id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Crime Type</p>
                    <p className="text-lg font-semibold">
                      {selectedReport.crimeType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Mobile Number</p>
                    <p className="text-lg">{selectedReport.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Reported At</p>
                    <p className="text-lg">
                      {formatDate(selectedReport.reportedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-white">{selectedReport.description}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Location</p>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-white mb-2">
                      {selectedReport.location.address}
                    </p>
                    <p className="text-sm text-gray-400">
                      Coordinates: {selectedReport.location.latitude.toFixed(6)}
                      , {selectedReport.location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 text-white resize-none"
                  />
                </div>

                {selectedReport.status === "pending" && (
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleVerifyReport("verified")}
                      disabled={processingReport}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                    >
                      {processingReport ? "Processing..." : "✅ Verify Report"}
                    </button>
                    <button
                      onClick={() => handleVerifyReport("spam")}
                      disabled={processingReport}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                    >
                      {processingReport ? "Processing..." : "🚫 Mark as Spam"}
                    </button>
                  </div>
                )}

                {selectedReport.status === "verified" && (
                  <button
                    onClick={() => handleVerifyReport("resolved")}
                    disabled={processingReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    {processingReport ? "Processing..." : "✔️ Mark as Resolved"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
