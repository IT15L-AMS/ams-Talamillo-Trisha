const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function setupDatabase() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║         Database Setup & Initialization               ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    //THIS IS FOR YOUR GUIDE PO HHEEHE
    // Step 1: Connect to MySQL without database (to create database)
    console.log(" Step 1: Connecting to MySQL Server...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });
    console.log(" Connected to MySQL successfully!\n");

    // Step 2: Create database
    console.log(" Step 2: Creating database...");
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`,
    );
    console.log(` Database "${process.env.DB_NAME}" created/verified!\n`);

    await connection.end();

    console.log(" Step 3: Connecting to database...");
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
      multipleStatements: true,
    });
    console.log(` Connected to database "${process.env.DB_NAME}"!\n`);

    // Step 4: Read and execute schema
    console.log(" Step 4: Importing schema...");
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    let count = 0;
    for (const statement of statements) {
      try {
        await dbConnection.execute(statement + ";");
        count++;
      } catch (error) {
        if (error.code === "ER_TABLE_EXISTS_ERROR") {
          // Table already exists, skip
          console.log(`   ⚠️  Table already exists, skipping...`);
        } else if (
          error.message.includes("already exists") ||
          error.message.includes("Duplicate")
        ) {
          // Duplicate entry, skip
          console.log(`   Data already exists, skipping...`);
        } else if (error.code === "ERR000") {
          // Empty statement, skip
          continue;
        } else {
          console.log(`     Warning: ${error.message}`);
        }
      }
    }
    console.log(
      ` Schema imported successfully! (${count} statements executed)\n`,
    );

    // Step 5: Verify tables
    console.log(" Step 5: Verifying tables...");
    const [tables] = await dbConnection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME],
    );
    console.log(` Found ${tables.length} tables:\n`);
    tables.forEach((table) => console.log(`   ✓ ${table.TABLE_NAME}`));

    // Step 6: Verify roles
    console.log("\n Step 6: Verifying roles...");
    const [roles] = await dbConnection.execute("SELECT * FROM roles;");
    console.log(` Found ${roles.length} roles:\n`);
    roles.forEach((role) =>
      console.log(`   ✓ ${role.role_name} (ID: ${role.id})`),
    );

    // Step 7: Verify permissions
    console.log("\n Step 7: Verifying permissions...");
    const [permissions] = await dbConnection.execute(
      "SELECT * FROM permissions;",
    );
    console.log(` Found ${permissions.length} permissions\n`);

    await dbConnection.end();

    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║        ✅ Database Setup Complete!                    ║");
    console.log("║                                                        ║");
    console.log("║  Your database is ready to use!                       ║");
    console.log("║  You can now start the server with: npm run dev       ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Database Setup Failed!\n");
    console.error("Error:", error.message);

    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("\n⚠️  MySQL Server is not running!");
      console.error("Please start MySQL and try again.");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n⚠️  Access Denied!");
      console.error("Please check your DB_USER and DB_PASSWORD in .env");
    } else if (error.code === "ER_UNKNOWN_DATABASE") {
      console.error("\n⚠️  Database does not exist!");
      console.error("The database creation failed.");
    }

    process.exit(1);
  }
}

// Run setup
setupDatabase();
