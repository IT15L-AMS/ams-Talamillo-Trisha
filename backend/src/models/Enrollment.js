const pool = require("../config/database");

class Enrollment {
  // Enroll student in course
  static async enroll({ student_id, course_id }) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO enrollments (student_id, course_id, enrolled_at)
         VALUES (?, ?, NOW())`,
        [student_id, course_id],
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  // Drop course (soft delete)
  static async drop(id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(`UPDATE enrollments SET dropped_at=NOW() WHERE id=?`, [
        id,
      ]);
      return true;
    } finally {
      conn.release();
    }
  }

  // Get all enrollments (active only by default)
  static async getAll({ activeOnly = true } = {}) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT e.*, s.full_name AS student_name, s.student_id AS student_code,
                c.course_code, c.title AS course_title,
                (SELECT g.grade FROM grades g WHERE g.enrollment_id = e.id ORDER BY g.assigned_at DESC LIMIT 1) AS grade
         FROM enrollments e
         LEFT JOIN students s ON e.student_id = s.id
         LEFT JOIN courses c ON e.course_id = c.id
         ${activeOnly ? "WHERE e.dropped_at IS NULL" : ""}`,
      );
      return rows;
    } finally {
      conn.release();
    }
  }

  static async getByStudent(student_id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT e.*, s.full_name AS student_name, s.student_id AS student_code,
                c.course_code, c.title AS course_title,
                (SELECT g.grade FROM grades g WHERE g.enrollment_id = e.id ORDER BY g.assigned_at DESC LIMIT 1) AS grade
         FROM enrollments e
         LEFT JOIN students s ON e.student_id = s.id
         LEFT JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = ? AND e.dropped_at IS NULL`,
        [student_id],
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}
module.exports = Enrollment;
