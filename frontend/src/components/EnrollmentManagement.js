import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import EnrollmentForm from "./EnrollmentForm";
import GradeForm from "./GradeForm";

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
      const enrollmentsList = Array.isArray(res.data?.enrollments)
        ? res.data.enrollments
        : Array.isArray(res.data)
          ? res.data
          : [];
      setEnrollments(enrollmentsList);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = Array.isArray(enrollments)
    ? enrollments.filter(
        (enrollment) =>
          String(enrollment.student_id || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(enrollment.course_code || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(enrollment.student_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
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
    if (window.confirm("Are you sure you want to drop this course?")) {
      try {
        await apiService.dropCourse(enrollmentId, token);
        loadEnrollments();
      } catch (err) {
        setError("Error dropping course");
      }
    }
  };

  const canManageEnrollments = ["admin", "registrar"].includes(user?.role);
  const canAssignGrades = ["admin", "instructor"].includes(user?.role);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Enrollment Management</h2>
        <div style={styles.buttonGroup}>
          {canManageEnrollments && (
            <button
              onClick={() => setShowEnrollmentForm(true)}
              style={styles.addBtn}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#229954")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#27ae60")}
            >
              + Enroll Student
            </button>
          )}
          {canAssignGrades && (
            <button
              onClick={() => setShowGradeForm(true)}
              style={styles.gradeBtn}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
            >
              📊 Assign Grade
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Search by student ID, course code, or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#bdc3c7")}
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
        />
      )}

      {loading ? (
        <div style={styles.loadingText}>⏳ Loading enrollments...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Student ID</th>
              <th style={styles.headerCell}>Student Name</th>
              <th style={styles.headerCell}>Course Code</th>
              <th style={styles.headerCell}>Course Title</th>
              <th style={styles.headerCell}>Grade</th>
              <th style={styles.headerCell}>Status</th>
              <th style={styles.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnrollments.length > 0 ? (
              filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} style={styles.row}>
                  <td style={styles.cell}>{enrollment.student_id}</td>
                  <td style={styles.cell}>{enrollment.student_name}</td>
                  <td style={styles.cell}>{enrollment.course_code}</td>
                  <td style={styles.cell}>{enrollment.course_title}</td>
                  <td style={styles.cell}>{enrollment.grade || "-"}</td>
                  <td style={styles.cell}>
                    <span
                      style={
                        enrollment.dropped_at
                          ? styles.statusInactive
                          : styles.statusActive
                      }
                    >
                      {enrollment.dropped_at ? "✕ Dropped" : "✓ Active"}
                    </span>
                  </td>
                  <td style={styles.actions}>
                    {canManageEnrollments && !enrollment.dropped_at && (
                      <button
                        onClick={() => handleDropCourse(enrollment.id)}
                        style={styles.dropBtn}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#e74c3c")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#e74c3c")
                        }
                      >
                        Drop
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.emptyCell}>
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
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  addBtn: {
    padding: "10px 24px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
    fontSize: "14px",
  },
  gradeBtn: {
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
  actions: {
    padding: "10px",
    textAlign: "center",
  },
  dropBtn: {
    padding: "6px 12px",
    backgroundColor: "#c0392b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "background 0.3s",
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

export default EnrollmentManagement;
