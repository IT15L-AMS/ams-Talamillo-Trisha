const TokenManager = require("../utils/tokenManager");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
        code: "NO_TOKEN",
      });
    }

    const decoded = TokenManager.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
        code: "INVALID_TOKEN",
      });
    }

    // Attach user information to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      token,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "AUTH_ERROR",
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Check if user has required role
 * RBAC Login
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user context",
        code: "NO_USER_CONTEXT",
      });
    }

    const userRole = req.user.role?.toLowerCase();
    const hasRole = allowedRoles.some(
      (role) => role.toLowerCase() === userRole,
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden - Access requires one of the following roles: ${allowedRoles.join(", ")}`,
        code: "INSUFFICIENT_PERMISSION",
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Verifies token if provided, but doesn't fail if missing
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (token) {
      const decoded = TokenManager.verifyAccessToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
          token,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user context
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
