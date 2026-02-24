import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import "../styles/StudentList.css";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiService.getStudents(token).then((res) => setStudents(res.data.students));
  }, []);

  return (
    <div className="student-list-container">
      <h2>Student List</h2>
      <table className="student-list-table">
        <thead className="student-list-thead">
          <tr>
            <th className="student-list-th">ID</th>
            <th className="student-list-th">Name</th>
            <th className="student-list-th">Email</th>
            <th className="student-list-th">Year Level</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="student-list-td">{student.id}</td>
              <td className="student-list-td">{student.full_name}</td>
              <td className="student-list-td">{student.email}</td>
              <td className="student-list-td">{student.year_level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
