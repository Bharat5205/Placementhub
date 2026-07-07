require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('1. Deleting every table in the current Neon database...');
    // Get all tables
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    for (const row of res.rows) {
      console.log(`Executing: DROP TABLE IF EXISTS "${row.table_name}" CASCADE;`);
      await pool.query(`DROP TABLE IF EXISTS "${row.table_name}" CASCADE;`);
    }
    console.log('All tables dropped successfully.\n');

    console.log('2. Executing database/schema.sql from the beginning...');
    const schemaSql = fs.readFileSync(__dirname + '/src/database/schema.sql', 'utf8');
    console.log('Executing SQL statement:\n', schemaSql);
    await pool.query(schemaSql);
    console.log('schema.sql executed successfully.\n');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
