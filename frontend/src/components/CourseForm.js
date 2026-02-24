import React, { useState } from "react";
import apiService from "../services/apiService";

const CourseForm = ({ onSuccess, onCancel, initialData, token }) => {
  const [formData, setFormData] = useState(
    initialData || {
      course_code: "",
      title: "",
      units: 3,
      instructor_id: null,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "units" || name === "instructor_id"
          ? value
            ? parseInt(value)
            : null
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData?.id) {
        // Update
        await apiService.updateCourse(initialData.id, formData, token);
      } else {
        // Create
        await apiService.createCourse(formData, token);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>{initialData?.id ? "Edit Course" : "Create New Course"}</h3>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Course Code:</label>
          <input
            type="text"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            disabled={!!initialData?.id}
            required
            placeholder="CS101"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Introduction to Programming"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Units/Credits:</label>
          <input
            type="number"
            name="units"
            value={formData.units}
            onChange={handleChange}
            min="1"
            max="6"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label>Instructor ID (Optional):</label>
          <input
            type="number"
            name="instructor_id"
            value={formData.instructor_id || ""}
            onChange={handleChange}
            placeholder="5"
          />
          <small style={{ color: "#666" }}>
            Enter the user ID of the instructor
          </small>
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Saving..." : "Save Course"}
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

export default CourseForm;
