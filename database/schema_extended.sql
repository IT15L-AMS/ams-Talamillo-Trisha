-- Academic Management System - for  Extended Schema 
-- This Includes: students, courses, enrollments, grades, dashboards
--This for  future guide only hehe
-- STUDENTS TABLE
CREATE TABLE  students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  year_level INT NOT NULL,
  program VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- COURSES TABLE
CREATE TABLE  courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  units INT NOT NULL,
  instructor_id INT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ENROLLMENTS TABLE (Many-to-Many: students <-> courses)
CREATE TABLE  enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dropped_at TIMESTAMP NULL,
  UNIQUE KEY uk_student_course (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- GRADES TABLE
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id INT NOT NULL,
  grade VARCHAR(5),
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- DASHBOARD VIEWS (for reporting)
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
