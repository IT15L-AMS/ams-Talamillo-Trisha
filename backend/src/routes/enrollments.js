const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, enrollmentController.enrollStudent);

router.delete("/:id", authenticate, enrollmentController.dropCourse);

router.get("/", authenticate, enrollmentController.getEnrollments);

router.get(
  "/student/:student_id",
  authenticate,
  enrollmentController.getStudentEnrollments,
);

module.exports = router;
