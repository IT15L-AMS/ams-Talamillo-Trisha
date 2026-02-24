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
    <div className="form-container">
      <h3>Assign Grade</h3>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="enrollment_id">Enrollment:</label>
          <select
            name="enrollment_id"
            id="enrollment_id"
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

        <div className="form-group">
          <label htmlFor="grade">Grade:</label>
          <select
            name="grade"
            id="grade"
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

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Assigning..." : "Assign Grade"}
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

export default GradeForm;
