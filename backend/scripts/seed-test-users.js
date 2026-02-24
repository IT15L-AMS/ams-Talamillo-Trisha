const mysql = require("mysql2/promise");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "academic_management_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testUsers = [
  {
    full_name: "Admin User",
    email: "admin@test.com",
    password: "Admin@123",
    role_id: 1,
  },
  {
    full_name: "Registrar User",
    email: "registrar@test.com",
    password: "Registrar@123",
    role_id: 2,
  },
  {
    full_name: "Instructor User",
    email: "instructor@test.com",
    password: "Instructor@123",
    role_id: 3,
  },
  {
    full_name: "Student User",
    email: "student@test.com",
    password: "Student@123",
    role_id: 4,
  },
];

async function seedUsers() {
  const conn = await pool.getConnection();
  try {
    console.log("🌱 Starting to seed test users...\n");

    for (const user of testUsers) {
      // Hash password
      const password_hash = await bcryptjs.hash(user.password, 10);

      // Insert or update user
      const query = `
        INSERT INTO users (full_name, email, password_hash, role_id, is_active)
        VALUES (?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name)
      `;

      await conn.execute(query, [
        user.full_name,
        user.email,
        password_hash,
        user.role_id,
      ]);

      console.log(` Created/Updated: ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role ID: ${user.role_id}\n`);
    }

    console.log(" All test users seeded successfully!\n");
    console.log(" TEST LOGIN CREDENTIALS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    testUsers.forEach((user) => {
      const roles = {
        1: "Admin",
        2: "Registrar",
        3: "Instructor",
        4: "Student",
      };
      console.log(`\n${roles[user.role_id]}:`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password}`);
    });
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error(" Error seeding users:", error);
    throw error;
  } finally {
    await conn.release();
    await pool.end();
  }
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
