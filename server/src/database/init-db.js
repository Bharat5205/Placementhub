const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initDb() {
  try {
    console.log('⚡ Starting Database Schema Initialization...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute multi-statement SQL schema
    await pool.query(schemaSql);
    console.log('✅ Database schema initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database schema initialization failed:', err.message);
    process.exit(1);
  }
}

initDb();
