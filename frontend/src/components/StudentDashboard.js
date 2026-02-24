import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const StudentDashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiService
      .getStudentDashboard(token)
      .then((res) => setDashboard(res.data.dashboard));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>
      {dashboard ? (
        <div>
          <p>Enrolled Courses: {dashboard.enrolled_courses}</p>
          <p>Grades Received: {dashboard.grades_received}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StudentDashboard;
