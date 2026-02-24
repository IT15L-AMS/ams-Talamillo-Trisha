const pool = require("../config/database");

class Course {
  // Create a new course
  static async create({ course_code, title, units, instructor_id = null }) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO courses (course_code, title, units, instructor_id, is_active, created_at)
				 VALUES (?, ?, ?, ?, 1, NOW())`,
        [course_code, title, units, instructor_id],
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
        `SELECT c.*, u.full_name AS instructor_name
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         ${activeOnly ? "WHERE c.is_active=1" : ""}`,
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT c.*, u.full_name AS instructor_name
         FROM courses c
         LEFT JOIN users u ON c.instructor_id = u.id
         WHERE c.id = ?`,
        [id],
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  }

  // Update course
  static async update(id, { title, units }) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE courses SET title=?, units=?, updated_at=NOW() WHERE id=?`,
        [title, units, id],
      );
      return true;
    } finally {
      conn.release();
    }
  }

  static async assignInstructor(id, instructor_id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE courses SET instructor_id=?, updated_at=NOW() WHERE id=?`,
        [instructor_id, id],
      );
      return true;
    } finally {
      conn.release();
    }
  }
}
module.exports = Course;
