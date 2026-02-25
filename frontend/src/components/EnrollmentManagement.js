import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import EnrollmentForm from "./EnrollmentForm";
import GradeForm from "./GradeForm";
import "../styles/EnrollmentManagement.css";

const EnrollmentManagement = ({ token, user }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEnrollments();
  }, [token]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const res = await apiService.getEnrollments(token);
      const list = Array.isArray(res.data?.enrollments)
        ? res.data.enrollments
        : Array.isArray(res.data)
          ? res.data
          : [];
      setEnrollments(list);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const canManageEnrollments =
    user?.role === "admin" ||
    user?.role === "registrar" ||
    user?.role === "staff";
  const canAssignGrades = user?.role === "admin" || user?.role === "instructor";

  const filteredEnrollments = Array.isArray(enrollments)
    ? enrollments.filter((e) => {
        const term = searchTerm.toLowerCase();
        return (
          String(e.student_code || "")
            .toLowerCase()
            .includes(term) ||
          String(e.student_name || "")
            .toLowerCase()
            .includes(term) ||
          String(e.course_code || "")
            .toLowerCase()
            .includes(term)
        );
      })
    : [];

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentForm(false);
    loadEnrollments();
  };

  const handleGradeSuccess = () => {
    setShowGradeForm(false);
    loadEnrollments();
  };

  const handleDropCourse = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to drop this enrollment?"))
      return;
    try {
      await apiService.dropCourse(enrollmentId, token);
      loadEnrollments();
    } catch (err) {
      setError(err.response?.data?.message || "Error dropping enrollment");
    }
  };
  return (
    <div className="em-container">
      <div className="em-header">
        <h2 className="em-title">👥 Enrollment Management</h2>
        <div className="em-button-group">
          {canManageEnrollments && (
            <button
              className="em-add-btn"
              onClick={() => setShowEnrollmentForm(true)}
            >
              + Enroll Student
            </button>
          )}
          {canAssignGrades && (
            <button
              className="em-grade-btn"
              onClick={() => setShowGradeForm(true)}
            >
              📊 Assign Grade
            </button>
          )}
        </div>
      </div>

      {error && <div className="em-error">⚠️ {error}</div>}

      <div className="em-search-bar">
        <input
          type="text"
          className="em-search-input"
          placeholder="🔍 Search by student ID, course code, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showEnrollmentForm && (
        <EnrollmentForm
          onSuccess={handleEnrollmentSuccess}
          onCancel={() => setShowEnrollmentForm(false)}
          token={token}
        />
      )}

      {showGradeForm && (
        <GradeForm
          onSuccess={handleGradeSuccess}
          onCancel={() => setShowGradeForm(false)}
          token={token}
          userId={user?.id}
        />
      )}

      {loading ? (
        <div className="em-loading-text">⏳ Loading enrollments...</div>
      ) : (
        <table className="em-table">
          <thead className="em-header-row">
            <tr>
              <th className="em-header-cell">Student ID</th>
              <th className="em-header-cell">Student Name</th>
              <th className="em-header-cell">Course Code</th>
              <th className="em-header-cell">Course Title</th>
              <th className="em-header-cell">Grade</th>
              <th className="em-header-cell">Status</th>
              <th className="em-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="em-row">
                  <td className="em-cell">
                    {enrollment.student_code || enrollment.student_id}
                  </td>
                  <td className="em-cell">{enrollment.student_name}</td>
                  <td className="em-cell">{enrollment.course_code}</td>
                  <td className="em-cell">{enrollment.course_title}</td>
                  <td className="em-cell">{enrollment.grade || "-"}</td>
                  <td className="em-cell">
                    <span
                      className={
                        enrollment.dropped_at
                          ? "em-status-inactive"
                          : "em-status-active"
                      }
                    >
                      {enrollment.dropped_at ? "✗ Dropped" : "✓ Active"}
                    </span>
                  </td>
                  <td className="em-actions">
                    {canManageEnrollments && !enrollment.dropped_at && (
                      <button
                        className="em-drop-btn"
                        onClick={() => handleDropCourse(enrollment.id)}
                      >
                        Drop
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="em-empty-cell">
                  🚫 No enrollments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EnrollmentManagement;
