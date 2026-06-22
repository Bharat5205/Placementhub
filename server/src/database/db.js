const pg = require('pg');
pg.types.setTypeParser(1082, (val) => val);
const { Pool } = pg;
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const dbUrl = (process.env.DATABASE_URL || '').trim();

const poolConfig = dbUrl
  ? {
      connectionString: dbUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: (process.env.DB_HOST || '').trim() || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: (process.env.DB_NAME || '').trim() || 'crms_db',
      user: (process.env.DB_USER || '').trim() || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Increased from 2000 to handle Neon cold starts
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

// Auto-migration: check and update users table schema
(async () => {
  try {
    // 1. Add coordinator, password reset, and Google OAuth columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS department VARCHAR(100),
      ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
    `);

    // Create indexes if they don't exist
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);

    // Drop NOT NULL constraint on password_hash to allow Google OAuth logins
    await pool.query(`
      ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    `);

    // Add application_link and logo_url to companies if they don't exist
    await pool.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS application_link TEXT,
      ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);
    `);

    // Add title, role_offered, difficulty_level, resources_links, created_by to interview_experiences if they don't exist
    await pool.query(`
      ALTER TABLE interview_experiences
      ADD COLUMN IF NOT EXISTS title VARCHAR(255),
      ADD COLUMN IF NOT EXISTS role_offered VARCHAR(150),
      ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20),
      ADD COLUMN IF NOT EXISTS resources_links TEXT,
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
    `);
    
    // 2. Update column size limits
    await pool.query(`
      ALTER TABLE users ALTER COLUMN roll_number TYPE VARCHAR(50);
      ALTER TABLE users ALTER COLUMN cgpa TYPE DECIMAL(4, 2);
      ALTER TABLE companies ALTER COLUMN eligibility_cgpa TYPE DECIMAL(4, 2);
    `);

    // 3. Migrate notification_reads to use student_id instead of user_id
    await pool.query(`
      DO $$ 
      BEGIN 
          IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'notification_reads' AND column_name = 'user_id'
          ) THEN
              DROP TABLE IF EXISTS notification_reads CASCADE;
          END IF;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_reads (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID REFERENCES users(id) ON DELETE CASCADE,
          notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
          read_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(student_id, notification_id)
      );
      CREATE INDEX IF NOT EXISTS idx_notification_reads_student ON notification_reads(student_id);
    `);

    console.log('✅ Database schema verified and updated (coordinator fields, password reset tokens, roll_number limits, CGPA precision, application_link, interview experience fields, notification_reads student_id columns).');
  } catch (err) {
    console.error('⚠️ Database schema migration check failed:', err.message);
  }
})();

module.exports = { query, getClient, pool };
