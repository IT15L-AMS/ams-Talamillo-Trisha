const jwt = require("jsonwebtoken");

class TokenManager {
  //Generate Access Token

  static generateAccessToken(userId, role, email) {
    const payload = {
      userId,
      role,
      email,
      type: "access",
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
      algorithm: "HS256",
    });
  }

  static generateRefreshToken(userId) {
    const payload = {
      userId,
      type: "refresh",
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
      algorithm: "HS256",
    });
  }

  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== "access") {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== "refresh") {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  //Decode token without verification

  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = TokenManager;
