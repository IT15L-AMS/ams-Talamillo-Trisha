const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");

router.post("/", gradeController.assignGrade);

router.put("/:id", gradeController.updateGrade);

router.get("/", gradeController.getGrades);

router.get("/student/:student_id", gradeController.getStudentGrades);

module.exports = router;
