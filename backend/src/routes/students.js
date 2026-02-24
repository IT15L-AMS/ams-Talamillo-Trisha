const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { authenticate } = require("../middleware/auth");

router.post("/", studentController.createStudent);

router.get("/", studentController.getStudents);

// Get my student record (authenticated users)
router.get("/me", authenticate, studentController.getMyStudent);

router.get("/:id", studentController.getStudentById);

router.put("/:id", studentController.updateStudent);

router.patch("/:id/deactivate", studentController.deactivateStudent);

module.exports = router;
