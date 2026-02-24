const pool = require("../config/database");

const getAdminDashboard = async (req, res) => {
  try {
    const [stats] = await pool.getConnection().then((conn) => {
      const results = conn.execute(`
        SELECT 
          (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
          (SELECT COUNT(*) FROM courses WHERE is_active=1) AS total_courses,
          (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments
      `);
      conn.release();
      return results;
    });
    res.json({ success: true, dashboard: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getRegistrarDashboard = async (req, res) => {
  try {
    const [stats] = await pool.getConnection().then((conn) => {
      const results = conn.execute(`
        SELECT 
          (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
          (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments
      `);
      conn.release();
      return results;
    });
    res.json({ success: true, dashboard: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInstructorDashboard = async (req, res) => {
  try {
    const instructorId = req.user.userId;
    const conn = await pool.getConnection();
    const [courses] = await conn.execute(
      `SELECT id, course_code, title FROM courses WHERE instructor_id=?`,
      [instructorId],
    );
    conn.release();
    res.json({
      success: true,
      dashboard: { assigned_courses: courses.length, courses },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.params.student_id || req.user.userId;
    const conn = await pool.getConnection();
    const [enrollments] = await conn.execute(
      `SELECT COUNT(*) as count FROM enrollments WHERE student_id=? AND dropped_at IS NULL`,
      [studentId],
    );
    const [grades] = await conn.execute(
      `SELECT COUNT(*) as count FROM grades WHERE enrollment_id IN (SELECT id FROM enrollments WHERE student_id=?)`,
      [studentId],
    );
    conn.release();
    res.json({
      success: true,
      dashboard: {
        enrolled_courses: enrollments[0].count,
        grades_received: grades[0].count,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminDashboard,
  getRegistrarDashboard,
  getInstructorDashboard,
  getStudentDashboard,
};
