const Grade = require("../models/Grade");
const Student = require("../models/Student");

const assignGrade = async (req, res) => {
  try {
    const { enrollment_id, grade } = req.body;
    // use authenticated user as assigned_by if not provided
    const assigned_by = req.body.assigned_by || req.user?.userId || null;

    if (!enrollment_id || !grade) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const id = await Grade.assign({ enrollment_id, grade, assigned_by });
    res.status(201).json({ success: true, message: "Grade assigned", id });
  } catch (err) {
    console.error("Assign grade error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    await Grade.update(req.params.id, { grade });
    res.json({ success: true, message: "Grade updated" });
  } catch (err) {
    console.error("Update grade error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getGrades = async (req, res) => {
  try {
    const grades = await Grade.getAll();
    res.json({ success: true, grades });
  } catch (err) {
    console.error("Get grades error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getStudentGrades = async (req, res) => {
  try {
    let requestedStudentId = req.params.student_id;

    // allow 'me' shortcut or missing id -> map using authenticated user's email
    if (!requestedStudentId || requestedStudentId === "me") {
      const myStudent = await Student.getByEmail(req.user.email);
      if (!myStudent) {
        // Return empty list when no student record exists
        return res.json({ success: true, grades: [] });
      }
      requestedStudentId = myStudent.id;
    }

    requestedStudentId = parseInt(requestedStudentId, 10);

    // If requester is a student, ensure they can only fetch their own grades
    if ((req.user?.role || "").toLowerCase() === "student") {
      const myStudent = await Student.getByEmail(req.user.email);
      if (!myStudent || myStudent.id !== requestedStudentId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const grades = await Grade.getByStudent(requestedStudentId);
    res.json({ success: true, grades });
  } catch (err) {
    console.error("Get student grades error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  assignGrade,
  updateGrade,
  getGrades,
  getStudentGrades,
};
