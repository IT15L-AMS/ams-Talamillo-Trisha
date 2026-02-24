const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "academic_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const extendedSchema = `
-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  year_level INT NOT NULL,
  program VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_email (email),
  INDEX idx_is_active (is_active)
);

-- COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  units INT NOT NULL,
  instructor_id INT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_course_code (course_code),
  INDEX idx_instructor_id (instructor_id),
  INDEX idx_is_active (is_active)
);

-- ENROLLMENTS TABLE (Many-to-Many: students <-> courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dropped_at TIMESTAMP NULL,
  UNIQUE KEY uk_student_course (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_course_id (course_id)
);

-- GRADES TABLE
CREATE TABLE IF NOT EXISTS grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id INT NOT NULL,
  grade VARCHAR(5),
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_enrollment_id (enrollment_id),
  INDEX idx_assigned_by (assigned_by)
);

-- DASHBOARD VIEWS
CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT 
  (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
  (SELECT COUNT(*) FROM courses WHERE is_active=1) AS total_courses,
  (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments;

CREATE OR REPLACE VIEW v_dashboard_registrar AS
SELECT 
  (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
  (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments;

CREATE OR REPLACE VIEW v_dashboard_instructor AS
SELECT 
  u.id AS instructor_id,
  u.full_name AS instructor_name,
  COUNT(c.id) AS assigned_courses
FROM users u
LEFT JOIN courses c ON c.instructor_id = u.id
WHERE u.role_id = 3
GROUP BY u.id;

CREATE OR REPLACE VIEW v_dashboard_student AS
SELECT 
  s.id AS student_id,
  s.full_name,
  COUNT(e.id) AS enrolled_courses,
  COUNT(g.id) AS grades_received
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.id AND e.dropped_at IS NULL
LEFT JOIN grades g ON g.enrollment_id = e.id
GROUP BY s.id;
`;

async function runMigration() {
  const conn = await pool.getConnection();
  try {
    console.log(" Running extended schema migration...\n");

   
    const tables = [
      `CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        year_level INT NOT NULL,
        program VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_email (email),
        INDEX idx_is_active (is_active)
      )`,

      `CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        units INT NOT NULL,
        instructor_id INT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_course_code (course_code),
        INDEX idx_instructor_id (instructor_id),
        INDEX idx_is_active (is_active)
      )`,

      `CREATE TABLE IF NOT EXISTS enrollments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dropped_at TIMESTAMP NULL,
        UNIQUE KEY uk_student_course (student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
        INDEX idx_course_id (course_id)
      )`,

      `CREATE TABLE IF NOT EXISTS grades (
        id INT PRIMARY KEY AUTO_INCREMENT,
        enrollment_id INT NOT NULL,
        grade VARCHAR(5),
        assigned_by INT,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_enrollment_id (enrollment_id),
        INDEX idx_assigned_by (assigned_by)
      )`,
    ];

    for (const tableStmt of tables) {
      await conn.execute(tableStmt);
      const tableName = tableStmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      console.log(` ${tableName}`);
    }

    console.log("\n Creating dashboard views...\n");

    // Create views after tables exist
    const views = [
      {
        name: "v_dashboard_admin",
        sql: `CREATE OR REPLACE VIEW v_dashboard_admin AS
SELECT 
  (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
  (SELECT COUNT(*) FROM courses WHERE is_active=1) AS total_courses,
  (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments`,
      },
      {
        name: "v_dashboard_registrar",
        sql: `CREATE OR REPLACE VIEW v_dashboard_registrar AS
SELECT 
  (SELECT COUNT(*) FROM students WHERE is_active=1) AS total_students,
  (SELECT COUNT(*) FROM enrollments WHERE dropped_at IS NULL) AS total_enrollments`,
      },
      {
        name: "v_dashboard_instructor",
        sql: `CREATE OR REPLACE VIEW v_dashboard_instructor AS
SELECT 
  u.id AS instructor_id,
  u.full_name AS instructor_name,
  COUNT(c.id) AS assigned_courses
FROM users u
LEFT JOIN courses c ON c.instructor_id = u.id
WHERE u.role_id = 3
GROUP BY u.id`,
      },
      {
        name: "v_dashboard_student",
        sql: `CREATE OR REPLACE VIEW v_dashboard_student AS
SELECT 
  s.id AS student_id,
  s.full_name,
  COUNT(e.id) AS enrolled_courses,
  COUNT(g.id) AS grades_received
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.id AND e.dropped_at IS NULL
LEFT JOIN grades g ON g.enrollment_id = e.id
GROUP BY s.id`,
      },
    ];

    for (const view of views) {
      try {
        await conn.execute(view.sql);
        console.log(` ${view.name}`);
      } catch (err) {
        console.error(` Error creating ${view.name}: ${err.message}`);
      }
    }

    console.log("\n Extended schema migration completed!\n");
  } catch (error) {
    console.error(" Migration error:", error.message);
    throw error;
  } finally {
    await conn.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});
