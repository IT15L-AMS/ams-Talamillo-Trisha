import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const EnrollmentForm = ({ onSuccess, onCancel, token, studentId }) => {
  const [formData, setFormData] = useState({
    student_id: studentId || "",
    course_id: "",
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        apiService.getStudents(token),
        apiService.getCourses(token),
      ]);
      setStudents(studentsRes.data.students || []);
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      setError("Error loading students or courses");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.student_id || !formData.course_id) {
      setError("Please select both student and course");
      setLoading(false);
      return;
    }

    try {
      await apiService.enroll(formData, token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Error enrolling student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h3>Enroll Student in Course</h3>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Student:</label>
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
            disabled={!!studentId}
          >
            <option value="">-- Select Student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} ({student.student_id})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Course:</label>
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? "Enrolling..." : "Enroll Student"}
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

export default EnrollmentForm;
