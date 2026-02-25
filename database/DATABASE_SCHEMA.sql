-- Full RBAC with Auth, Students, Courses, Enrollments, Grades

CREATE DATABASE IF NOT EXISTS academic_management_system;
USE academic_management_system;

-- 1. ROLES TABLE - Core RBAC
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Role name (admin, registrar, instructor, student)',
  description TEXT COMMENT 'Role description',
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_role_name (role_name),
  INDEX idx_is_active (is_active)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores system roles for RBAC';

-- 2. USERS TABLE - Authentication & Identity
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX idx_email (email),
  INDEX idx_role_id (role_id),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user information with authentication details';

-- 3. PERMISSIONS TABLE - Fine-grained Permissions
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50) COMMENT 'Module/Feature this permission belongs to',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_permission_name (permission_name),
  INDEX idx_module (module)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores fine-grained permissions for advanced RBAC';

-- 4. ROLE_PERMISSIONS TABLE - Role-Permission Mapping
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maps permissions to roles for RBAC';

-- 5. USER_PERMISSIONS TABLE - User-specific Permissions
CREATE TABLE user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_permissions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  UNIQUE KEY uk_user_permission (user_id, permission_id),
  INDEX idx_user_id (user_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user-specific permissions (overrides role permissions)';

-- 6. AUDIT_LOG TABLE - Security & Compliance
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(50) NOT NULL COMMENT 'Action performed (login, register, delete, etc)',
  resource_type VARCHAR(100) COMMENT 'Type of resource affected',
  resource_id INT,
  details JSON COMMENT 'Additional details about the action',
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
  user_agent TEXT COMMENT 'Browser/client user agent',
  status ENUM('success', 'failure') DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for security and compliance';

-- 7. TOKEN_BLACKLIST TABLE - Token Invalidation
CREATE TABLE token_blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token_jti VARCHAR(500) UNIQUE NOT NULL COMMENT 'JWT ID for revocation',
  user_id INT NOT NULL,
  reason VARCHAR(255) COMMENT 'Reason for blacklisting',
  expires_at TIMESTAMP COMMENT 'When token expires naturally',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_token_blacklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores revoked tokens for logout functionality';

-- 8. STUDENTS TABLE - Student Records
CREATE TABLE students (
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
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores student records';

-- 9. COURSES TABLE - Course Catalog
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  units INT NOT NULL,
  instructor_id INT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_course_code (course_code),
  INDEX idx_instructor_id (instructor_id),
  INDEX idx_is_active (is_active)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores course information';

-- 10. ENROLLMENTS TABLE - Student-Course Enrollment
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dropped_at TIMESTAMP NULL COMMENT 'Soft delete - NULL means still enrolled',
  
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  
  UNIQUE KEY uk_student_course (student_id, course_id),
  INDEX idx_student_id (student_id),
  INDEX idx_course_id (course_id),
  INDEX idx_dropped_at (dropped_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Many-to-Many: students enrolled in courses';

-- 11. GRADES TABLE - Student Grades
CREATE TABLE grades (
  id INT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id INT NOT NULL,
  grade VARCHAR(5),
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_grades_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  CONSTRAINT fk_grades_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_enrollment_id (enrollment_id),
  INDEX idx_assigned_by (assigned_by),
  INDEX idx_assigned_at (assigned_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores student grades for enrolled courses';

-- VIEWS - Reporting
-- User with Role Information
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  r.role_name,
  r.description AS role_description,
  u.is_active,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- User Permissions (Role + Individual)
CREATE OR REPLACE VIEW v_user_permissions AS
SELECT DISTINCT
  u.id AS user_id,
  u.email,
  p.id AS permission_id,
  p.permission_name,
  p.module
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
UNION
SELECT 
  u.id AS user_id,
  u.email,
  p.id AS permission_id,
  p.permission_name,
  p.module
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
LEFT JOIN permissions p ON up.permission_id = p.id;

-- Dashboard Views
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
LEFT JOIN courses c ON c.instructor_id = u.id AND c.is_active = 1
LEFT JOIN roles r ON u.role_id = r.id
WHERE r.role_name = 'instructor' AND u.is_active = 1
GROUP BY u.id;

CREATE OR REPLACE VIEW v_dashboard_student AS
SELECT 
  s.id AS student_id,
  s.full_name,
  COUNT(DISTINCT e.id) AS enrolled_courses,
  COUNT(DISTINCT g.id) AS grades_received
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.id AND e.dropped_at IS NULL
LEFT JOIN grades g ON g.enrollment_id = e.id
WHERE s.is_active = 1
GROUP BY s.id;

-- ================================================
-- SEED DATA - DEFAULT ROLES
-- ================================================
INSERT IGNORE INTO roles (id, role_name, description) VALUES
  (1, 'admin', 'System administrator with full access'),
  (2, 'registrar', 'Registrar can manage students and generate reports'),
  (3, 'instructor', 'Instructor can manage courses and grades'),
  (4, 'student', 'Student can view personal information and courses');

-- SEED DATA - DEFAULT PERMISSIONS
INSERT IGNORE INTO permissions (permission_name, description, module) VALUES
  -- User Management
  ('user.create', 'Create new user', 'users'),
  ('user.read', 'View user information', 'users'),
  ('user.update', 'Update user information', 'users'),
  ('user.delete', 'Delete user', 'users'),
  ('user.list', 'List all users', 'users'),
  
  -- Role Management
  ('role.create', 'Create new role', 'roles'),
  ('role.read', 'View role information', 'roles'),
  ('role.update', 'Update role', 'roles'),
  ('role.delete', 'Delete role', 'roles'),
  ('role.list', 'List all roles', 'roles'),
  
  -- Course Management
  ('course.create', 'Create new course', 'courses'),
  ('course.read', 'View course information', 'courses'),
  ('course.update', 'Update course', 'courses'),
  ('course.delete', 'Delete course', 'courses'),
  ('course.list', 'List all courses', 'courses'),
  
  -- Grade Management
  ('grade.create', 'Create grade entry', 'grades'),
  ('grade.read', 'View grades', 'grades'),
  ('grade.update', 'Update grades', 'grades'),
  ('grade.delete', 'Delete grades', 'grades'),
  ('grade.list', 'List all grades', 'grades'),
  
  -- Student Management
  ('student.create', 'Create student record', 'students'),
  ('student.read', 'View student information', 'students'),
  ('student.update', 'Update student information', 'students'),
  ('student.delete', 'Delete student', 'students'),
  ('student.list', 'List all students', 'students'),
  
  -- Enrollment Management
  ('enrollment.create', 'Create enrollment', 'enrollments'),
  ('enrollment.read', 'View enrollments', 'enrollments'),
  ('enrollment.update', 'Update enrollment', 'enrollments'),
  ('enrollment.delete', 'Delete enrollment', 'enrollments'),
  ('enrollment.list', 'List all enrollments', 'enrollments');

-- ASSIGN PERMISSIONS TO ROLES

-- Admin - Full access
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;

-- Registrar - User, Course, Student, Enrollment management
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions WHERE module IN ('users', 'courses', 'students', 'enrollments');

-- Instructor - Course, Grade, and Enrollment read management
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 3, id FROM permissions WHERE module IN ('courses', 'grades', 'enrollments');

-- Student - Read-only access
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 4, id FROM permissions WHERE permission_name LIKE '%.read' OR permission_name = 'enrollment.create';

