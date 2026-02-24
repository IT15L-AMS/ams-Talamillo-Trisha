const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

// GET /dashboard/admin - Admin dashboard (stats)
router.get(
  "/admin",
  authenticate,
  authorize("admin"),
  dashboardController.getAdminDashboard,
);

router.get(
  "/registrar",
  authenticate,
  authorize("registrar"),
  dashboardController.getRegistrarDashboard,
);

router.get(
  "/instructor",
  authenticate,
  authorize("instructor"),
  dashboardController.getInstructorDashboard,
);

// GET /dashboard/student - Student dashboard (enrollments, grades)
router.get(
  "/student",
  authenticate,
  authorize("student"),
  dashboardController.getStudentDashboard,
);

module.exports = router;
