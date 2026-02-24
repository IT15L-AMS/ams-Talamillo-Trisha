const Enrollment = require("../models/Enrollment");

const enrollStudent = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const id = await Enrollment.enroll({ student_id, course_id });
    res.status(201).json({ success: true, message: "Student enrolled", id });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const dropCourse = async (req, res) => {
  try {
    await Enrollment.drop(req.params.id);
    res.json({ success: true, message: "Course dropped" });
  } catch (err) {
    console.error("Drop enrollment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.getAll();
    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.getByStudent(req.params.student_id);
    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("Get student enrollments error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  enrollStudent,
  dropCourse,
  getEnrollments,
  getStudentEnrollments,
};
