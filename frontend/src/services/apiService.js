import axios from "axios";

const API_URL = "http://localhost:3000/api";

const apiService = {
  apiService: axios,

  // Auth
  login: (email, password) =>
    axios.post(`${API_URL}/auth/login`, { email, password }),
  register: (fullName, email, password, role) =>
    axios.post(`${API_URL}/auth/register`, { fullName, email, password, role }),
  getProfile: (token) =>
    axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Students
  createStudent: (data, token) =>
    axios.post(`${API_URL}/students`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getStudents: (token) =>
    axios.get(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getStudent: (id, token) =>
    axios.get(`${API_URL}/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateStudent: (id, data, token) =>
    axios.put(`${API_URL}/students/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  deactivateStudent: (id, token) =>
    axios.patch(
      `${API_URL}/students/${id}/deactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  // Courses
  createCourse: (data, token) =>
    axios.post(`${API_URL}/courses`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getCourses: (token) =>
    axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getCourse: (id, token) =>
    axios.get(`${API_URL}/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateCourse: (id, data, token) =>
    axios.put(`${API_URL}/courses/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  assignInstructor: (id, instructorId, token) =>
    axios.patch(
      `${API_URL}/courses/${id}/assign-instructor`,
      { instructor_id: instructorId },
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  // Enrollments
  enroll: (data, token) =>
    axios.post(`${API_URL}/enrollments`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  dropCourse: (enrollmentId, token) =>
    axios.delete(`${API_URL}/enrollments/${enrollmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getEnrollments: (token) =>
    axios.get(`${API_URL}/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getStudentEnrollments: (studentId, token) =>
    axios.get(`${API_URL}/enrollments/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Grades
  getStudentGrades: (studentId, token) =>
    axios.get(`${API_URL}/grades/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getGrades: (token) =>
    axios.get(`${API_URL}/grades`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  assignGrade: (data, token) =>
    axios.post(`${API_URL}/grades`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  updateGrade: (id, data, token) =>
    axios.put(`${API_URL}/grades/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Dashboard
  getAdminDashboard: (token) =>
    axios.get(`${API_URL}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getRegistrarDashboard: (token) =>
    axios.get(`${API_URL}/dashboard/registrar`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getInstructorDashboard: (token) =>
    axios.get(`${API_URL}/dashboard/instructor`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getStudentDashboard: (token) =>
    axios.get(`${API_URL}/dashboard/student`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default apiService;
