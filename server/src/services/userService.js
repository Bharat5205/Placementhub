const { query } = require('../database/db');

const userService = {
  // Find user by email
  findByEmail: async (email) => {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  // Find user by id
  findById: async (id) => {
    const result = await query(
      'SELECT id, name, email, role, roll_number, branch, cgpa, department, employee_id, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Create user (student or coordinator)
  // NOTE: role must be explicitly controlled server-side; never pass a client-supplied role directly.
  createUser: async ({ name, email, passwordHash, role, rollNumber, branch, cgpa, department, employeeId, googleId, authProvider }) => {
    // Whitelist accepted roles — default to 'student' for safety
    const safeRole = ['student', 'coordinator'].includes(role) ? role : 'student';

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, roll_number, branch, cgpa, department, employee_id, google_id, auth_provider)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, name, email, role, roll_number, branch, cgpa, department, employee_id, created_at`,
      [
        name,
        email,
        passwordHash || null,
        safeRole,
        rollNumber || null,
        branch || null,
        cgpa || null,
        department || null,
        employeeId || null,
        googleId || null,
        authProvider || 'local'
      ]
    );
    return result.rows[0];
  },

  // Create student user
  createStudent: async ({ name, email, passwordHash, rollNumber, branch, cgpa }) => {
    return userService.createUser({
      name,
      email,
      passwordHash,
      role: 'student',
      rollNumber,
      branch,
      cgpa
    });
  },

  // Update refresh token
  updateRefreshToken: async (id, token) => {
    await query('UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2', [token, id]);
  },

  // Find user by google id
  findByGoogleId: async (googleId) => {
    const result = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows[0];
  },

  // Link google ID to existing account
  linkGoogleAccount: async (id, googleId) => {
    const result = await query(
      `UPDATE users SET google_id = $1, auth_provider = 'google', updated_at = NOW()
       WHERE id = $2 RETURNING id, name, email, role`,
      [googleId, id]
    );
    return result.rows[0];
  },

  // Store hashed password-reset token with expiry
  storeResetToken: async (id, hashedToken, expiry) => {
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW() WHERE id = $3',
      [hashedToken, expiry, id]
    );
  },

  // Find user by hashed reset token (must not be expired)
  findByResetToken: async (hashedToken) => {
    const result = await query(
      `SELECT id, name, email, role FROM users
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [hashedToken]
    );
    return result.rows[0];
  },

  // Clear reset token after successful password change
  clearResetToken: async (id, newPasswordHash) => {
    await query(
      `UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [newPasswordHash, id]
    );
  },

  // Find by refresh token
  findByRefreshToken: async (token) => {
    const result = await query('SELECT * FROM users WHERE refresh_token = $1', [token]);
    return result.rows[0];
  },

  // Update profile
  updateProfile: async (id, { name, branch, cgpa, department, employeeId }) => {
    const result = await query(
      `UPDATE users SET name = $1, branch = COALESCE($2, branch), cgpa = COALESCE($3, cgpa), department = COALESCE($4, department), employee_id = COALESCE($5, employee_id), updated_at = NOW()
       WHERE id = $6 RETURNING id, name, email, role, roll_number, branch, cgpa, department, employee_id`,
      [name, branch || null, cgpa || null, department || null, employeeId || null, id]
    );
    return result.rows[0];
  },

  // Get all students with pagination
  getAllStudents: async ({ search, branch, minCgpa, maxCgpa, limit, offset }) => {
    let conditions = ["role = 'student'"];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR roll_number ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (branch) {
      conditions.push(`branch = $${paramCount}`);
      params.push(branch);
      paramCount++;
    }
    if (minCgpa !== undefined) {
      conditions.push(`cgpa >= $${paramCount}`);
      params.push(minCgpa);
      paramCount++;
    }
    if (maxCgpa !== undefined) {
      conditions.push(`cgpa <= $${paramCount}`);
      params.push(maxCgpa);
      paramCount++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT id, name, email, roll_number, branch, cgpa, created_at FROM users
       ${where} ORDER BY name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    return { data: result.rows, total };
  },

  // Count all students
  countStudents: async () => {
    const result = await query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    return parseInt(result.rows[0].count);
  },
};

module.exports = userService;
