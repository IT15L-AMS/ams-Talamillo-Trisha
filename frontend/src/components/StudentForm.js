import React, { useState } from "react";
import apiService from "../services/apiService";
import "../styles/StudentForm.css";

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
    <div className="form-container">
      <h3>{initialData?.id ? "Edit Student" : "Create New Student"}</h3>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="student_id">Student ID:</label>
          <input
            type="text"
            name="student_id"
            id="student_id"
            value={formData.student_id}
            onChange={handleChange}
            disabled={!!initialData?.id}
            required
            placeholder="STU-001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="full_name">Full Name:</label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="John Smith"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="student@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="year_level">Year Level:</label>
          <select
            name="year_level"
            id="year_level"
            value={formData.year_level}
            onChange={handleChange}
          >
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="program">Program:</label>
          <input
            type="text"
            name="program"
            id="program"
            value={formData.program}
            onChange={handleChange}
            required
            placeholder="Computer Science"
          />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Student"}
          </button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ...existing code...

export default StudentForm;
