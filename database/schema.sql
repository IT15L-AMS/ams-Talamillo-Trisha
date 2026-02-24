CREATE DATABASE academic_management_system;
USE academic_management_system;


CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL COMMENT 'Role name (admin, registrar, instructor, student)',
  DESCRIPTION TEXT COMMENT 'Role description',
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_role_name (role_name),
  INDEX idx_is_active (is_active)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores system roles';

-- USER TABLE
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX idx_email (email),
  INDEX idx_role_id (role_id),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user information with authentication details';

-- PERMISSIONS TABLE (Extended RBAC)
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  DESCRIPTION TEXT,
  module VARCHAR(50) COMMENT 'Module/Feature this permission belongs to',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_permission_name (permission_name),
  INDEX idx_module (module)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores fine-grained permissions';

-- ROLE_PERMISSIONS TABLE (Junction)
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Maps permissions to roles for RBAC';


-- 5. USER_PERMISSIONS TABLE (User-specific permissions)
CREATE TABLE user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_permissions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  UNIQUE KEY uk_user_permission (user_id, permission_id),
  INDEX idx_user_id (user_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores user-specific permissions (overrides role permissions)';


-- 6. AUDIT_LOG TABLE (Security & Compliance)
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  ACTION VARCHAR(50) NOT NULL COMMENT 'Action performed (login, register, delete, etc)',
  resource_type VARCHAR(100) COMMENT 'Type of resource affected',
  resource_id INT,
  details JSON COMMENT 'Additional details about the action',
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
  user_agent TEXT COMMENT 'Browser/client user agent',
  STATUS ENUM('success', 'failure') DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_action (ACTION),
  INDEX idx_created_at (created_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for security and compliance';

-- 7. TOKEN_BLACKLIST TABLE (Token Invalidation)
CREATE TABLE token_blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token_jti VARCHAR(500) UNIQUE NOT NULL COMMENT 'JWT ID for revocation',
  user_id INT NOT NULL,
  reason VARCHAR(255) COMMENT 'Reason for blacklisting',
  expires_at TIMESTAMP COMMENT 'When token expires naturally',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_token_blacklist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores revoked tokens for logout functionality';

-- SEED DATA - DEFAULT ROLES
INSERT IGNORE INTO roles (id, role_name, DESCRIPTION) VALUES
  (1, 'admin', 'System administrator with full access'),
  (2, 'registrar', 'Registrar can manage students and generate reports'),
  (3, 'instructor', 'Instructor can manage courses and grades'),
  (4, 'student', 'Student can view personal information and courses');


-- SEED DATA - DEFAULT PERMISSIONS
INSERT IGNORE INTO permissions (permission_name, DESCRIPTION, module) VALUES
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
  ('grade.list', 'List all grades', 'grades');


-- ASSIGN PERMISSIONS TO ROLES
-- Admin - Full access
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;

-- Registrar - User and Course management
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions WHERE module IN ('users', 'courses');

-- Instructor - Course and Grade management
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 3, id FROM permissions WHERE module IN ('courses', 'grades');

-- Student - Read-only access
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 4, id FROM permissions WHERE permission_name LIKE '%.read';


-- SAMPLE USERS (Optional - for testing)
-- Note: Passwords are NOT included here. You must create users through the API
-- This ensures passwords are properly hashed with bcryptjs

INSERT IGNORE INTO users (id, full_name, email, password_hash, role_id, is_active) VALUES
  (1, 'System Administrator', 'admin@academicms.com', '$2a$10$example_hashed_password_do_not_use', 1, 1),
  (2, 'Head Registrar', 'registrar@academicms.com', '$2a$10$example_hashed_password_do_not_use', 2, 1),
  (3, 'Sample Instructor', 'instructor@academicms.com', '$2a$10$example_hashed_password_do_not_use', 3, 1),
  (4, 'Sample Student', 'student@academicms.com', '$2a$10$example_hashed_password_do_not_use', 4, 1);


-- VIEWS (Optional - for reporting)

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


