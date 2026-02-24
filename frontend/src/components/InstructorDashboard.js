import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const InstructorDashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiService
      .getInstructorDashboard(token)
      .then((res) => setDashboard(res.data.dashboard))
      .catch((err) => {
        console.error(
          "Instructor dashboard error:",
          err.response || err.message,
        );
      });

    // Also fetch all courses and compute those assigned to this instructor
    const loadCourses = async () => {
      try {
        const res = await apiService.getCourses(token);
        const all = Array.isArray(res.data?.courses)
          ? res.data.courses
          : Array.isArray(res.data)
            ? res.data
            : [];

        const instructorId =
          user?.id || user?.user_id || user?.id_number || user?.uid || null;
        const filtered = all.filter((c) => {
          // Compare as numbers or strings to be robust
          const ic = c.instructor_id;
          if (instructorId == null) return false;
          return String(ic) === String(instructorId);
        });
        setAssignedCourses(filtered);
      } catch (err) {
        console.error(
          "Error loading courses for instructor:",
          err.response || err.message,
        );
      }
    };

    loadCourses();
  }, [token, user]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Instructor Dashboard</h2>
      {dashboard ? (
        <div>
          {dashboard.total_courses !== undefined && (
            <p>Total Courses (backend): {dashboard.total_courses}</p>
          )}
          {dashboard.total_students !== undefined && (
            <p>Assigned Students: {dashboard.total_students}</p>
          )}
          {dashboard.pending_grades !== undefined && (
            <p>Pending Grades: {dashboard.pending_grades}</p>
          )}
          <hr />
          <h3>Assigned Courses (computed)</h3>
          {assignedCourses.length > 0 ? (
            <ul>
              {assignedCourses.map((c) => (
                <li key={c.id}>
                  {c.course_code} — {c.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No assigned courses found for this user.</p>
          )}
          {/* Fallback: show raw dashboard object when fields differ */}
          {typeof dashboard === "object" && (
            <pre style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
              {JSON.stringify(dashboard, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InstructorDashboard;
