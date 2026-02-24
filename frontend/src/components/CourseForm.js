import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import "../styles/CourseForm.css";

const CourseForm = ({ onSuccess, onCancel, initialData, token }) => {
  const [formData, setFormData] = useState(
    initialData || {
      course_code: "",
      title: "",
      units: 3,
      instructor_id: null,
    },
  );
  const [instructors, setInstructors] = useState([]);
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

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        if (!token) return setInstructors([]);
        // Quick decode to check role in token; avoid fetching users for non-admins
        const parseJwt = (tkn) => {
          try {
            return JSON.parse(atob(tkn.split(".")[1]));
          } catch (e) {
            return null;
          }
        };
        const decoded = parseJwt(token);
        if (!decoded || (decoded.role || "").toLowerCase() !== "admin") {
          return setInstructors([]);
        }

        const res = await apiService.getUsers(token, 100, 0);
        const users = res.data.data || [];
        const ins = users.filter(
          (u) => (u.role || "").toLowerCase() === "instructor",
        );
        setInstructors(ins);
      } catch (err) {
        setInstructors([]);
      }
    };
    loadInstructors();
  }, [token]);

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
          <label htmlFor="instructor_id">Instructor (optional):</label>
          <select
            name="instructor_id"
            id="instructor_id"
            value={formData.instructor_id || ""}
            onChange={handleChange}
          >
            <option value="">-- Unassigned --</option>
            {instructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.fullName || ins.full_name} (ID: {ins.id})
              </option>
            ))}
          </select>
          <small>Select an instructor to assign to this course</small>
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
