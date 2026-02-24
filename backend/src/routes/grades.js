const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");
const { authenticate, authorize } = require("../middleware/auth");

router.post(
  "/",
  authenticate,
  authorize("instructor"),
  gradeController.assignGrade,
);

router.put(
  "/:id",
  authenticate,
  authorize("instructor"),
  gradeController.updateGrade,
);

router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  gradeController.getGrades,
);

router.get(
  "/student/:student_id",
  authenticate,
  gradeController.getStudentGrades,
);

module.exports = router;
