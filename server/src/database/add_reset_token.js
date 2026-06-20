const { query } = require('./db');

async function run() {
  try {
    console.log('⚡ Adding reset_token columns to users table...');
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);
    console.log('✅ Migration complete: reset_token columns added.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
