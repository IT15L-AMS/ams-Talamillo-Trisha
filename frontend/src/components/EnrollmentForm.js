import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import "../styles/EnrollmentForm.css";

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
    // if no studentId was provided (self-enroll), fetch mapped student record
    if (!studentId) {
      fetchMyStudent();
    }
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

  const fetchMyStudent = async () => {
    try {
      const res = await apiService.getMyStudent(token);
      const student = res.data.student;
      if (student && student.id) {
        setFormData((prev) => ({ ...prev, student_id: student.id }));
      }
    } catch (err) {
      // ignore - leave selection available for manual choose
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

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const isStudent = (currentUser?.role || "").toLowerCase() === "student";

    if (!isStudent && !formData.student_id) {
      setError("Please select a student");
      setLoading(false);
      return;
    }
    if (!formData.course_id) {
      setError("Please select a course");
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
    <div className="form-container">
      <h3>Enroll Student in Course</h3>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {(JSON.parse(localStorage.getItem("user") || "null")?.role || "") !==
          "student" && (
          <div className="form-group">
            <label htmlFor="student_id">Student:</label>
            <select
              name="student_id"
              id="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
              disabled={!!studentId || !!formData.student_id}
            >
              <option value="">-- Select Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.student_id})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="course_id">Course:</label>
          <select
            name="course_id"
            id="course_id"
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

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Enrolling..." : "Enroll Student"}
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

export default EnrollmentForm;
