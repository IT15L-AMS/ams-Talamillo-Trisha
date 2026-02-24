import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import "../styles/StudentManagement.css";

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "instructor",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, [token]);

  const loadUsers = async () => {
    try {
      const res = await apiService.getUsers(token, 100, 0);
      setUsers(res.data.data || []);
    } catch (err) {
      setError("Error loading users");
    }
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiService.register(
        form.fullName,
        form.email,
        form.password,
        form.role,
      );
      setForm({ fullName: "", email: "", password: "", role: "instructor" });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm-container">
      <div className="sm-header">
        <h2 className="sm-title">User Management</h2>
      </div>

      {error && <div className="sm-error">{error}</div>}

      <div className="form-container" style={{ marginBottom: 20 }}>
        <h3>Create User</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="instructor">Instructor</option>
              <option value="registrar">Registrar</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="button-group">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      <h3>Existing (students shown as fallback)</h3>
      <table className="sm-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Full Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.student_id || "-"}</td>
              <td>{u.full_name || u.fullName || u.name || "-"}</td>
              <td>{u.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
