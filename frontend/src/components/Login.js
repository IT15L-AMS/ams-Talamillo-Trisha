import React, { useState } from "react";
import apiService from "../services/apiService";
import "../styles/login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.login(email, password);
      const { data } = response.data;

      // Extract token and user data
      const token = data.accessToken || data.token;
      const userObj = data.user || data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userObj,
          fullName: userObj.fullName || userObj.full_name,
          role: userObj.role,
        }),
      );

      onLogin({
        ...userObj,
        fullName: userObj.fullName || userObj.full_name,
        role: userObj.role,
      });
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Academic Management System</h2>
        <h3 className="login-subtitle">Sign In to Your Account</h3>
        {error && <p className="login-error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <input
              className="login-input"
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              className="login-input"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        <div className="login-demo">
          <p>Demo Credentials:</p>
          <p>Email: admin@example.com</p>
          <p>Password: (check database)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
