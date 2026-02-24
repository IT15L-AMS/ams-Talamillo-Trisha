const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);


 //Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Academic Management System - Authentication & Authorization API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
    },
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
