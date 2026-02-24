const express = require("express");
const {
  register,
  login,
  getProfile,
  refreshToken,
  getAllUsers,
  deleteUser,
  updateUserRole,
} = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * Public Routes
 */

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refreshToken);

/**
 * Protected Routes (Requires Authentication)
 */

// Get current user profile
router.get("/profile", authenticate, getProfile);

/**
 * Admin Only Routes
 */

router.get("/users", authenticate, authorize("admin"), getAllUsers);

router.delete("/users/:id", authenticate, authorize("admin"), deleteUser);

router.put("/users/:id/role", authenticate, authorize("admin"), updateUserRole);

module.exports = router;
