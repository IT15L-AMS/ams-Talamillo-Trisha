import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiService.getStudents(token).then((res) => setStudents(res.data.students));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student List</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Email</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>
              Year Level
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {student.id}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {student.full_name}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {student.email}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                {student.year_level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
