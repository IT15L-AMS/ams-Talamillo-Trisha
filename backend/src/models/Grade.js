const pool = require("../config/database");

class Grade {
  // Assign grade
  static async assign({ enrollment_id, grade, assigned_by }) {
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO grades (enrollment_id, grade, assigned_by, assigned_at)
         VALUES (?, ?, ?, NOW())`,
        [enrollment_id, grade, assigned_by],
      );
      return result.insertId;
    } finally {
      conn.release();
    }
  }

  // Update grade
  static async update(id, { grade }) {
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE grades SET grade=?, updated_at=NOW() WHERE id=?`,
        [grade, id],
      );
      return true;
    } finally {
      conn.release();
    }
  }

  // Get all grades
  static async getAll() {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(`SELECT * FROM grades`);
      return rows;
    } finally {
      conn.release();
    }
  }

  // Get grades for a student
  static async getByStudent(student_id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        `SELECT g.* FROM grades g
         JOIN enrollments e ON g.enrollment_id = e.id
         WHERE e.student_id=?`,
        [student_id],
      );
      return rows;
    } finally {
      conn.release();
    }
  }
}
module.exports = Grade;
