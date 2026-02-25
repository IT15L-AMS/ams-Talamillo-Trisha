import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import "../styles/registrar.css";

const RegistrarDashboard = ({ user, token }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getRegistrarDashboard(token);
      if (res.data?.dashboard) {
        setDashboard(res.data.dashboard);
      } else {
        setDashboard(null);
      }
    } catch (err) {
      console.error(
        "Error loading registrar dashboard:",
        err.response?.data || err.message,
      );
      setError(
        err.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={loadDashboard} className="submit-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="registrar-dashboard">
      <h2>Registrar Dashboard</h2>
      <div className="dashboard-summary">
        {dashboard ? (
          <>
            <div className="dashboard-card">
              <h3>Total Students</h3>
              <p className="dashboard-number">
                {dashboard.total_students || 0}
              </p>
            </div>
            <div className="dashboard-card">
              <h3>Total Enrollments</h3>
              <p className="dashboard-number">
                {dashboard.total_enrollments || 0}
              </p>
            </div>
          </>
        ) : (
          <p>No dashboard data available</p>
        )}
      </div>

      <div className="dashboard-info">
        <h3>Registrar Responsibilities</h3>
        <ul>
          <li>Manage student records</li>
          <li>View enrollment summary</li>
          <li>Track course enrollments</li>
          <li>Generate enrollment reports</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistrarDashboard;
