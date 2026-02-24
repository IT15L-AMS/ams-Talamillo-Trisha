import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const GradeForm = ({ onSuccess, onCancel, token, userId }) => {
  const [formData, setFormData] = useState({
    enrollment_id: "",
    grade: "",
  });
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      // Get all enrollments
      const res = await apiService.apiService.get(
        "http://localhost:3000/api/enrollments",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Format enrollments with student and course info
      const formatted =
        res.data.enrollments?.map((e) => ({
          ...e,
          label: `Student ${e.student_id} - Course ${e.course_id}`,
        })) || [];

      setEnrollments(formatted);
    } catch (err) {
      setError("Error loading enrollments");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "enrollment_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.enrollment_id || !formData.grade) {
      setError("Please select enrollment and grade");
      setLoading(false);
      return;
    }

    try {
      await apiService.assignGrade(
        {
          enrollment_id: formData.enrollment_id,
          grade: formData.grade,
          assigned_by: userId,
        },
        token,
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error assigning grade");
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "F",
  ];

  return (
    <div style={styles.formContainer}>
      <h3>Assign Grade</h3>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Enrollment:</label>
          <select
            name="enrollment_id"
            value={formData.enrollment_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Enrollment --</option>
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {enrollment.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Grade:</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Grade --</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Assigning..." : "Assign Grade"}
          </button>
          <button type="button" style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "20px auto",
  },
  formGroup: {
    marginBottom: "15px",
  },
  error: {
    color: "#d32f2f",
    backgroundColor: "#ffebee",
    padding: "12px",
    borderRadius: "4px",
    marginBottom: "15px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  submitBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default GradeForm;
