import React, { useState } from "react";
import apiService from "../services/apiService";
import "../styles/CourseForm.css";

const CourseForm = ({ onSuccess, onCancel, initialData, token }) => {
  const [formData, setFormData] = useState(
    initialData || {
      course_code: "",
      title: "",
      units: 3,
      instructor_name: null,
    },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "units" || name === "instructor_name"
          ? value
            ? name === "units" ? parseInt(value) : value
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
    <div className="form-container">
      <h3>{initialData?.id ? "Edit Course" : "Create New Course"}</h3>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course_code">Course Code:</label>
          <input
            type="text"
            name="course_code"
            id="course_code"
            value={formData.course_code}
            onChange={handleChange}
            disabled={!!initialData?.id}
            required
            placeholder="CS101"
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Introduction to Programming"
          />
        </div>

        <div className="form-group">
          <label htmlFor="units">Units/Credits:</label>
          <input
            type="number"
            name="units"
            id="units"
            value={formData.units}
            onChange={handleChange}
            min="1"
            max="6"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructor_name">Instructor Name:</label>
          <input
            type="text"
            name="instructor_name"
            id="instructor_name"
            value={formData.instructor_name || ""}
            onChange={handleChange}
            placeholder="Instructor Name"
          />
          <small>Enter the name of the instructor</small>
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Course"}
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

export default CourseForm;
