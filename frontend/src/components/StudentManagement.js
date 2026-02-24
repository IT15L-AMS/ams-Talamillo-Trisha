import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import StudentForm from "./StudentForm";

const StudentManagement = ({ token, user }) => {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudents();
  }, [token]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await apiService.getStudents(token);
      const studentsList = Array.isArray(res.data?.students)
        ? res.data.students
        : Array.isArray(res.data)
          ? res.data
          : [];
      setStudents(studentsList);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter(
        (student) =>
          String(student.full_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(student.student_id || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          String(student.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleFormSuccess = () => {
    setShowForm(false);
    loadStudents();
  };

  const canManageStudents = ["admin", "registrar"].includes(user?.role);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📚 Student Management</h2>
        {canManageStudents && (
          <button
            onClick={() => setShowForm(true)}
            style={styles.addBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#229954")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#27ae60")}
          >
            + Add Student
          </button>
        )}
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => (e.target.style.borderColor = "#3498db")}
          onBlur={(e) => (e.target.style.borderColor = "#bdc3c7")}
        />
      </div>

      {showForm && (
        <StudentForm
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
          token={token}
        />
      )}

      {loading ? (
        <div style={styles.loadingText}>⏳ Loading students...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Student ID</th>
              <th style={styles.headerCell}>Full Name</th>
              <th style={styles.headerCell}>Email</th>
              <th style={styles.headerCell}>Year Level</th>
              <th style={styles.headerCell}>Program</th>
              <th style={styles.headerCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} style={styles.row}>
                  <td style={styles.cell}>{student.student_id}</td>
                  <td style={styles.cell}>{student.full_name}</td>
                  <td style={styles.cell}>{student.email}</td>
                  <td style={styles.cell}>Year {student.year_level}</td>
                  <td style={styles.cell}>{student.program}</td>
                  <td style={styles.cell}>
                    <span
                      style={
                        student.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }
                    >
                      {student.is_active ? "✓ Active" : "✕ Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.emptyCell}>
                  🚫 No students found
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
    backgroundColor: "#27ae60",
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

export default StudentManagement;
