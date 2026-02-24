const Student = require("../models/Student");

const createStudent = async (req, res) => {
  try {
    const { student_id, full_name, email, year_level, program } = req.body;
    if (!student_id || !full_name || !email || !year_level || !program) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const id = await Student.create({
      student_id,
      full_name,
      email,
      year_level,
      program,
    });
    res.status(201).json({ success: true, message: "Student created", id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.getById(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { full_name, email, year_level, program } = req.body;
    await Student.update(req.params.id, {
      full_name,
      email,
      year_level,
      program,
    });
    res.json({ success: true, message: "Student updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deactivateStudent = async (req, res) => {
  try {
    await Student.deactivate(req.params.id);
    res.json({ success: true, message: "Student deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
};
