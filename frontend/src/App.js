import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import InstructorDashboard from "./components/InstructorDashboard";
import StudentDashboard from "./components/StudentDashboard";
import StudentList from "./components/StudentList";
import StudentManagement from "./components/StudentManagement";
import CourseManagement from "./components/CourseManagement";
import EnrollmentManagement from "./components/EnrollmentManagement";
import "./styles/global.css";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const token = localStorage.getItem("token");

  const styles = {
    navbar: {
      backgroundColor: "#333",
      color: "white",
      padding: "15px 20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    navHeader: {
      marginBottom: "15px",
    },
    navMenu: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    navLink: {
      color: "white",
      textDecoration: "none",
      fontSize: "14px",
      padding: "8px 12px",
      borderRadius: "4px",
      transition: "background-color 0.3s",
      cursor: "pointer",
      display: "inline-block",
    },
    logoutBtn: {
      padding: "10px 20px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <nav style={styles.navbar}>
          <div style={styles.navHeader}>
            <h1>Academic Management System</h1>
            <p>
              Welcome {user.fullName} ({user.role})
            </p>
          </div>

          <div style={styles.navMenu}>
            <Link to="/" style={styles.navLink}>
              Dashboard
            </Link>

            {(user.role === "admin" || user.role === "registrar") && (
              <>
                <Link to="/students" style={styles.navLink}>
                  Students
                </Link>
                <Link to="/courses" style={styles.navLink}>
                  Courses
                </Link>
                <Link to="/enrollments" style={styles.navLink}>
                  Enrollments
                </Link>
              </>
            )}

            {user.role === "instructor" && (
              <>
                <Link to="/enrollments" style={styles.navLink}>
                  Enrollments
                </Link>
              </>
            )}

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </nav>

        <Routes>
          {user.role === "admin" && (
            <Route
              path="/"
              element={<AdminDashboard user={user} token={token} />}
            />
          )}
          {user.role === "student" && (
            <Route
              path="/"
              element={<StudentDashboard user={user} token={token} />}
            />
          )}
          {user.role === "instructor" && (
            <Route
              path="/"
              element={<InstructorDashboard user={user} token={token} />}
            />
          )}
          {user.role === "registrar" && (
            <Route
              path="/"
              element={<AdminDashboard user={user} token={token} />}
            />
          )}

          {(user.role === "admin" || user.role === "registrar") && (
            <>
              <Route
                path="/students"
                element={<StudentManagement user={user} token={token} />}
              />
              <Route
                path="/courses"
                element={<CourseManagement user={user} token={token} />}
              />
              <Route
                path="/enrollments"
                element={<EnrollmentManagement user={user} token={token} />}
              />
            </>
          )}

          {user.role === "instructor" && (
            <Route
              path="/enrollments"
              element={<EnrollmentManagement user={user} token={token} />}
            />
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
