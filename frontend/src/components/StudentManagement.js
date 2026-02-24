import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import StudentForm from "./StudentForm";
import "../styles/StudentManagement.css";

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
      const list = Array.isArray(res.data?.students)
        ? res.data.students
        : Array.isArray(res.data)
          ? res.data
          : [];
      setStudents(list);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error loading students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = Array.isArray(students)
    ? students.filter((s) => {
        const term = searchTerm.toLowerCase();
        return (
          String(s.student_id || "")
            .toLowerCase()
            .includes(term) ||
          String(s.full_name || "")
            .toLowerCase()
            .includes(term) ||
          String(s.email || "")
            .toLowerCase()
            .includes(term)
        );
      })
    : [];

  const canManageStudents =
    user?.role === "admin" ||
    user?.role === "registrar" ||
    user?.role === "staff";

  const handleFormSuccess = () => {
    setShowForm(false);
    loadStudents();
  };

  return (
    <div className="sm-container">
      <div className="sm-header">
        <h2 className="sm-title">📚 Student Management</h2>
        {canManageStudents && (
          <button className="sm-add-btn" onClick={() => setShowForm(true)}>
            + Add Student
          </button>
        )}
      </div>

      {error && <div className="sm-error">⚠️ {error}</div>}

      <div className="sm-search-bar">
        <input
          type="text"
          className="sm-search-input"
          placeholder="🔍 Search by name, ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <div className="sm-loading-text">⏳ Loading students...</div>
      ) : (
        <table className="sm-table">
          <thead className="sm-header-row">
            <tr>
              <th className="sm-header-cell">Student ID</th>
              <th className="sm-header-cell">Full Name</th>
              <th className="sm-header-cell">Email</th>
              <th className="sm-header-cell">Year Level</th>
              <th className="sm-header-cell">Program</th>
              <th className="sm-header-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="sm-row">
                  <td className="sm-cell">{student.student_id}</td>
                  <td className="sm-cell">{student.full_name}</td>
                  <td className="sm-cell">{student.email}</td>
                  <td className="sm-cell">Year {student.year_level}</td>
                  <td className="sm-cell">{student.program}</td>
                  <td className="sm-cell">
                    <span
                      className={
                        student.is_active
                          ? "sm-status-active"
                          : "sm-status-inactive"
                      }
                    >
                      {student.is_active ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="sm-empty-cell">
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

export default StudentManagement;
