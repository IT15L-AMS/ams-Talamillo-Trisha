const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");

router.post("/", enrollmentController.enrollStudent);

router.delete("/:id", enrollmentController.dropCourse);

router.get("/", enrollmentController.getEnrollments);

router.get("/student/:student_id", enrollmentController.getStudentEnrollments);

module.exports = router;
