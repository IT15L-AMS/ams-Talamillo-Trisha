const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");

router.post("/", courseController.createCourse);

router.get("/", courseController.getCourses);

router.get("/:id", courseController.getCourseById);

router.put("/:id", courseController.updateCourse);

router.patch("/:id/assign-instructor", courseController.assignInstructor);

module.exports = router;
