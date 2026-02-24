const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'academic_management_system'
    });

    console.log('\n✅ Connected to MySQL Database');
    console.log(`   Database: ${process.env.DB_NAME || 'academic_management_system'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}\n`);

    // Check tables
    const [rows] = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'academic_management_system']);

    console.log('📊 Database Tables:');
    rows.forEach(row => console.log(`   • ${row.TABLE_NAME}`));
    
    console.log(`\n✨ Total ${rows.length} tables found\n`);

    await conn.end();
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message, '\n');
    process.exit(1);
  }
})();
