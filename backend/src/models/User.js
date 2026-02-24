const pool = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  
  static async create(userData) {
    const connection = await pool.getConnection();
    try {
      const { fullName, email, password, roleId } = userData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (full_name, email, password_hash, role_id, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await connection.execute(query, [
        fullName,
        email,
        hashedPassword,
        roleId,
        true,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  //find user by email
  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT u.*, r.role_name as role
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = ? AND u.is_active = 1
      `;

      const [rows] = await connection.execute(query, [email]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT u.id, u.full_name, u.email, u.role_id, u.is_active, 
               r.role_name as role, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = 1
      `;

      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async emailExists(email) {
    const connection = await pool.getConnection();
    try {
      const query = "SELECT id FROM users WHERE email = ?";
      const [rows] = await connection.execute(query, [email]);
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }


  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  //Get all users (Admin only)
   
  static async getAll(limit = 10, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT u.id, u.full_name, u.email, u.role_id, u.is_active,
               r.role_name as role, u.created_at, u.updated_at
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.is_active = 1
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows] = await connection.execute(query, [limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Delete user (soft delete - mark as inactive)
   
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const query =
        "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?";
      const [result] = await connection.execute(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updateRole(userId, roleId) {
    const connection = await pool.getConnection();
    try {
      const query =
        "UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?";
      const [result] = await connection.execute(query, [roleId, userId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;
