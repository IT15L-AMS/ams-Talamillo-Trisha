require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`

  Academic Management System - Auth Service            
  Server running on: http://localhost:${PORT}${PORT < 10000 ? " " : ""}       
  Environment: ${process.env.NODE_ENV || "development"}${(process.env.NODE_ENV || "development").length === 11 ? " " : "  "}      
  API Base: http://localhost:${PORT}/api${PORT < 10000 ? " " : ""}             

  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
