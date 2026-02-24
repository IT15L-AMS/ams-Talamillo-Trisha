import React, { useState } from "react";
import apiService from "../services/apiService";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}
        >
          Academic Management System
        </h2>
        <h3
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
            fontSize: "16px",
          }}
        >
          Sign In to Your Account
        </h3>
        {error && (
          <p
            style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Sign In
          </button>
        </form>
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          <p>Demo Credentials:</p>
          <p style={{ margin: "5px 0" }}>Email: admin@example.com</p>
          <p style={{ margin: "5px 0" }}>Password: (check database)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
