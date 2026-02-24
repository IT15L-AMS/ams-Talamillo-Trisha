import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const AdminDashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiService
      .getAdminDashboard(token)
      .then((res) => setDashboard(res.data.dashboard));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      {dashboard ? (
        <div>
          <p>Total Students: {dashboard.total_students}</p>
          <p>Total Courses: {dashboard.total_courses}</p>
          <p>Total Enrollments: {dashboard.total_enrollments}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminDashboard;
