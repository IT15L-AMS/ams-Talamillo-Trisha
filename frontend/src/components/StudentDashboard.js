import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import EnrollmentForm from "./EnrollmentForm";

const StudentDashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const [grades, setGrades] = useState([]);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        // load dashboard (server maps 'me' using token/email)
        const dashRes = await apiService.getStudentDashboard(token);
        setDashboard(dashRes.data.dashboard);

        // fetch grades using 'me' shortcut
        const gradesRes = await apiService.getStudentGrades("me", token);
        setGrades(gradesRes.data.grades || []);
      } catch (err) {
        setDashboard(null);
        setGrades([]);
      }
    };

    load();
  }, [token, user]);

  const handleEnrollSuccess = () => {
    setShowEnrollForm(false);

    (async () => {
      try {
        const dashRes = await apiService.getStudentDashboard(token);
        setDashboard(dashRes.data.dashboard);
        const gradesRes = await apiService.getStudentGrades("me", token);
        setGrades(gradesRes.data.grades || []);
      } catch (err) {
        setGrades([]);
      }
    })();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>
      {dashboard ? (
        <div>
          <p>Enrolled Courses: {dashboard.enrolled_courses}</p>
          <p>Grades Received: {dashboard.grades_received}</p>

          <h3>Your Grades</h3>
          {grades.length > 0 ? (
            <table className="sm-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td>{g.course_title || g.course_code || g.course_id}</td>
                    <td>{g.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No grades yet.</p>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              className="submit-btn"
              onClick={() => setShowEnrollForm(true)}
            >
              Enroll in Course
            </button>
          </div>

          {showEnrollForm && (
            <EnrollmentForm
              onSuccess={handleEnrollSuccess}
              onCancel={() => setShowEnrollForm(false)}
              token={token}
              // EnrollmentForm will fetch student id server-side mapping via getMyStudent if studentId not provided
            />
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StudentDashboard;
