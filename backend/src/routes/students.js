const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.post("/", studentController.createStudent);

router.get("/", studentController.getStudents);

router.get("/:id", studentController.getStudentById);

router.put("/:id", studentController.updateStudent);

router.patch("/:id/deactivate", studentController.deactivateStudent);

module.exports = router;
