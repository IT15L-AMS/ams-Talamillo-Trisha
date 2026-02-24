import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import CourseForm from "./CourseForm";

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

  const handleFormSuccess = () => {
    setShowForm(false);
    loadCourses();
  };

  const canManageCourses = ["admin", "registrar"].includes(user?.role);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📖 Course Management</h2>
        {canManageCourses && (
          <button
            onClick={() => setShowForm(true)}
            style={styles.addBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
          >
            + Add Course
          </button>
        )}
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#bdc3c7")}
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
        <div style={styles.loadingText}>⏳ Loading courses...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Course Code</th>
              <th style={styles.headerCell}>Title</th>
              <th style={styles.headerCell}>Units</th>
              <th style={styles.headerCell}>Instructor ID</th>
              <th style={styles.headerCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id} style={styles.row}>
                  <td style={styles.cell}>{course.course_code}</td>
                  <td style={styles.cell}>{course.title}</td>
                  <td style={styles.cell}>{course.units}</td>
                  <td style={styles.cell}>
                    {course.instructor_id || "Unassigned"}
                  </td>
                  <td style={styles.cell}>
                    <span
                      style={
                        course.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {course.is_active ? "✓ Active" : "✕ Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={styles.emptyCell}>
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

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  title: {
    margin: 0,
    color: "#2c3e50",
    fontSize: "24px",
  },
  addBtn: {
    padding: "10px 24px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
    fontSize: "14px",
  },
  error: {
    color: "#c0392b",
    backgroundColor: "#fadbd8",
    padding: "14px",
    borderRadius: "6px",
    marginBottom: "20px",
    borderLeft: "4px solid #c0392b",
  },
  searchBar: {
    marginBottom: "25px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #bdc3c7",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "border-color 0.3s",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  headerRow: {
    backgroundColor: "#34495e",
    color: "white",
  },
  headerCell: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
  },
  row: {
    borderBottom: "1px solid #ecf0f1",
    transition: "background 0.2s",
  },
  cell: {
    padding: "15px",
    fontSize: "14px",
  },
  statusActive: {
    color: "#27ae60",
    fontWeight: "600",
  },
  statusInactive: {
    color: "#c0392b",
    fontWeight: "600",
  },
  emptyCell: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#95a5a6",
    fontSize: "14px",
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    color: "#7f8c8d",
  },
};

export default CourseManagement;
