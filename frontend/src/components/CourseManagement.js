import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import CourseForm from "./CourseForm";
import "../styles/CourseManagement.css";

const CourseManagement = ({ token, user }) => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, [token]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCourses(token);
      const coursesList = Array.isArray(res.data?.courses)
        ? res.data.courses
        : Array.isArray(res.data)
          ? res.data
          : [];
      setCourses(coursesList);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          String(course.course_code || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(course.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : [];

  const canManageCourses =
    user?.role === "admin" || user?.role === "instructor";

  const handleFormSuccess = () => {
    setShowForm(false);
    loadCourses();
  };

  return (
    <div className="cm-container">
      <div className="cm-header">
        <h2 className="cm-title">📖 Course Management</h2>
        {canManageCourses && (
          <button className="cm-add-btn" onClick={() => setShowForm(true)}>
            + Add Course
          </button>
        )}
      </div>

      {error && <div className="cm-error">⚠️ {error}</div>}

      <div className="cm-search-bar">
        <input
          type="text"
          className="cm-search-input"
          placeholder="🔍 Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <CourseForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
          token={token}
        />
      )}

      {loading ? (
        <div className="cm-loading-text">⏳ Loading courses...</div>
      ) : (
        <table className="cm-table">
          <thead className="cm-header-row">
            <tr>
              <th className="cm-header-cell">Course Code</th>
              <th className="cm-header-cell">Title</th>
              <th className="cm-header-cell">Units</th>
              <th className="cm-header-cell">Instructor </th>
              <th className="cm-header-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id} className="cm-row">
                  <td className="cm-cell">{course.course_code}</td>
                  <td className="cm-cell">{course.title}</td>
                  <td className="cm-cell">{course.units}</td>
                  <td className="cm-cell">
                    {course.instructor_name || "Unassigned"}
                  </td>
                  <td className="cm-cell">
                    <span
                      className={
                        course.is_active
                          ? "cm-status-active"
                          : "cm-status-inactive"
                      }
                    >
                      {course.is_active ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="cm-empty-cell">
                  🚫 No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default CourseManagement;
