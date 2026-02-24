const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const { course_code, title, units, instructor_id } = req.body;
    if (!course_code || !title || !units) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const id = await Course.create({
      course_code,
      title,
      units,
      instructor_id,
    });
    res.status(201).json({ success: true, message: "Course created", id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.getAll();
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.getById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { title, units } = req.body;
    await Course.update(req.params.id, { title, units });
    res.json({ success: true, message: "Course updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const assignInstructor = async (req, res) => {
  try {
    const { instructor_id } = req.body;
    await Course.assignInstructor(req.params.id, instructor_id);
    res.json({ success: true, message: "Instructor assigned" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  assignInstructor,
};
