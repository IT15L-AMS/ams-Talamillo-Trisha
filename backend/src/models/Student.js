const pool = require("../config/database");

class Student {
  // Create a new student
  static async create({ student_id, full_name, email, year_level, program }) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO students (student_id, full_name, email, year_level, program, is_active, created_at)
				 VALUES (?, ?, ?, ?, ?, 1, NOW())`,
        [student_id, full_name, email, year_level, program],
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  static async getAll({ activeOnly = true } = {}) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM students${activeOnly ? " WHERE is_active=1" : ""}`,
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(`SELECT * FROM students WHERE id=?`, [
        id,
      ]);
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async getByEmail(email) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT * FROM students WHERE email = ? AND is_active = 1 LIMIT 1`,
        [email],
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  static async update(id, { full_name, email, year_level, program }) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE students SET full_name=?, email=?, year_level=?, program=?, updated_at=NOW() WHERE id=?`,
        [full_name, email, year_level, program, id],
      );
      return true;
    } finally {
      conn.release();
    }
  }

  static async deactivate(id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE students SET is_active=0, updated_at=NOW() WHERE id=?`,
        [id],
      );
      return true;
    } finally {
      conn.release();
    }
  }
}
module.exports = Student;
