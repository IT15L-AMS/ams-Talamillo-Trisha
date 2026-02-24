const User = require("../models/User");
const Role = require("../models/Role");
const TokenManager = require("../utils/tokenManager");
const Validation = require("../utils/validation");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Register a new user
 * POST /auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const validationErrors = Validation.validateRegistration(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: validationErrors,
    });
  }

  const sanitizedEmail = Validation.sanitizeEmail(email);

  const emailExists = await User.emailExists(sanitizedEmail);
  if (emailExists) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
      code: "EMAIL_EXISTS",
    });
  }

  // Get role by name
  const roleData = await Role.findByName(role.toLowerCase());
  if (!roleData) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
      code: "INVALID_ROLE",
    });
  }

  // Create user
  try {
    const userId = await User.create({
      fullName: fullName.trim(),
      email: sanitizedEmail,
      password,
      roleId: roleData.id,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      code: "REGISTRATION_SUCCESS",
      data: {
        userId,
        email: sanitizedEmail,
        role: roleData.role_name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
});

/**
 * Login user
 * POST /auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validationErrors = Validation.validateLogin(req.body);
  if (validationErrors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: validationErrors,
    });
  }

  const sanitizedEmail = Validation.sanitizeEmail(email);

  // Find user
  const user = await User.findByEmail(sanitizedEmail);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    });
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(
    password,
    user.password_hash,
  );
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    });
  }

  // Generate tokens
  const accessToken = TokenManager.generateAccessToken(user.id, user.role);
  const refreshToken = TokenManager.generateRefreshToken(user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    code: "LOGIN_SUCCESS",
    data: {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  });
});

/**
 * Get current user profile
 * GET /auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    code: "PROFILE_SUCCESS",
    data: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  });
});

/**
 * Refresh access token
 * POST /auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Refresh token is required",
      code: "MISSING_REFRESH_TOKEN",
    });
  }

  const decoded = TokenManager.verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const newAccessToken = TokenManager.generateAccessToken(user.id, user.role);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    code: "TOKEN_REFRESH_SUCCESS",
    data: {
      accessToken: newAccessToken,
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  });
});

/**
 * Get all users (Admin only)
 * GET /auth/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || 10);
  const offset = parseInt(req.query.offset || 0);

  const users = await User.getAll(limit, offset);

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    code: "USERS_SUCCESS",
    data: users.map((user) => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
    })),
  });
});

/**
 * Delete user (Admin only)
 * DELETE /auth/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete your own account",
      code: "CANNOT_DELETE_SELF",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const deleted = await User.delete(id);

  if (!deleted) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete user",
      code: "DELETE_FAILED",
    });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    code: "USER_DELETED",
    data: {
      id: user.id,
      email: user.email,
    },
  });
});

/**
 * Update user role (Admin only)
 * PUT /auth/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role is required",
      code: "MISSING_ROLE",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  const roleData = await Role.findByName(role.toLowerCase());
  if (!roleData) {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
      code: "INVALID_ROLE",
    });
  }

  const updated = await User.updateRole(id, roleData.id);

  if (!updated) {
    return res.status(400).json({
      success: false,
      message: "Failed to update user role",
      code: "UPDATE_FAILED",
    });
  }

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    code: "ROLE_UPDATED",
    data: {
      id: user.id,
      email: user.email,
      newRole: roleData.role_name,
    },
  });
});

module.exports = {
  register,
  login,
  getProfile,
  refreshToken,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
