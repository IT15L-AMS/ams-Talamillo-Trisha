import React, { useState } from "react";
import apiService from "../services/apiService";

const StudentForm = ({ onSuccess, onCancel, initialData, token }) => {
  const [formData, setFormData] = useState(
    initialData || {
      student_id: "",
      full_name: "",
      email: "",
      year_level: 1,
      program: "",
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year_level" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData?.id) {
        // Update
        await apiService.updateStudent(initialData.id, formData, token);
      } else {
        // Create
        await apiService.createStudent(formData, token);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>{initialData?.id ? "Edit Student" : "Create New Student"}</h3>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Student ID:</label>
          <input
            type="text"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            disabled={!!initialData?.id}
            required
            placeholder="STU-001"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Full Name:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="John Smith"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="student@example.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Year Level:</label>
          <select
            name="year_level"
            value={formData.year_level}
            onChange={handleChange}
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Program:</label>
          <input
            type="text"
            name="program"
            value={formData.program}
            onChange={handleChange}
            required
            placeholder="Computer Science"
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Save Student"}
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

export default StudentForm;
