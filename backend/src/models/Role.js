const pool = require("../config/database");

class Role {
  // you can find role by nmae
  static async findByName(roleName) {
    const connection = await pool.getConnection();
    try {
      const query = "SELECT * FROM roles WHERE role_name = ? LIMIT 1";
      const [rows] = await connection.execute(query, [roleName]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

 //finding role by id
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const query = "SELECT * FROM roles WHERE id = ? LIMIT 1";
      const [rows] = await connection.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  //get all roles
  static async getAll() {
    const connection = await pool.getConnection();
    try {
      const query = "SELECT * FROM roles ORDER BY id ASC";
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async hasPermission(userId, permission) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_permissions up
        INNER JOIN users u ON up.user_id = u.id
        INNER JOIN permissions p ON up.permission_id = p.id
        WHERE u.id = ? AND p.permission_name = ?
      `;

      const [rows] = await connection.execute(query, [userId, permission]);
      return rows[0].count > 0;
    } finally {
      connection.release();
    }
  }

  //this create role by user
  static async create(roleName, description) {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO roles (role_name, description, created_at)
        VALUES (?, ?, NOW())
      `;

      const [result] = await connection.execute(query, [roleName, description]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // this can  Get permissions for a role
  static async getPermissionsByRole(roleId) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT p.* FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `;

      const [rows] = await connection.execute(query, [roleId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Role;
