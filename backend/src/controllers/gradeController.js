const Grade = require("../models/Grade");

const assignGrade = async (req, res) => {
  try {
    const { enrollment_id, grade, assigned_by } = req.body;
    if (!enrollment_id || !grade) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const id = await Grade.assign({ enrollment_id, grade, assigned_by });
    res.status(201).json({ success: true, message: "Grade assigned", id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    await Grade.update(req.params.id, { grade });
    res.json({ success: true, message: "Grade updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getGrades = async (req, res) => {
  try {
    const grades = await Grade.getAll();
    res.json({ success: true, grades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.getByStudent(req.params.student_id);
    res.json({ success: true, grades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  assignGrade,
  updateGrade,
  getGrades,
  getStudentGrades,
};
