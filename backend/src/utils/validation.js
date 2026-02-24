const validator = require("validator");

class Validation {
  //Validate email format
   
  static isValidEmail(email) {
    return validator.isEmail(email);
  }

  /**
   * Validate password strength
   * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   */
  static isStrongPassword(password) {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  }

  static isNotEmpty(str) {
    return validator.trim(str).length > 0;
  }


  static sanitizeEmail(email) {
    return validator.normalizeEmail(email);
  }

  static validateRegistration(data) {
    const errors = {};

    if (!this.isNotEmpty(data.fullName)) {
      errors.fullName = "Full name is required";
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = "Valid email is required";
    }

    if (!data.password) {
      errors.password = "Password is required";
    } else if (!this.isStrongPassword(data.password)) {
      errors.password =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    if (
      !data.role ||
      !["student", "instructor", "registrar", "admin"].includes(
        data.role.toLowerCase(),
      )
    ) {
      errors.role =
        "Valid role is required (student, instructor, registrar, admin)";
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }


  static validateLogin(data) {
    const errors = {};

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = "Valid email is required";
    }

    if (!this.isNotEmpty(data.password)) {
      errors.password = "Password is required";
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
}

module.exports = Validation;
