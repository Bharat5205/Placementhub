const { query } = require('../database/db');

const experienceService = {
  // Get approved experiences (for students)
  getApproved: async ({ search, companyName, role, year, limit, offset }) => {
    let conditions = ["status = 'approved'"];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(ie.company_name ILIKE $${paramCount} OR ie.experience ILIKE $${paramCount} OR ie.title ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (companyName) {
      conditions.push(`ie.company_name ILIKE $${paramCount}`);
      params.push(`%${companyName}%`);
      paramCount++;
    }
    if (role) {
      conditions.push(`ie.role_offered ILIKE $${paramCount}`);
      params.push(`%${role}%`);
      paramCount++;
    }
    if (year) {
      conditions.push(`ie.batch_year = $${paramCount}`);
      params.push(year);
      paramCount++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countResult = await query(
      `SELECT COUNT(*) FROM interview_experiences ie LEFT JOIN users u ON ie.student_id = u.id ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT ie.*, COALESCE(u.name, creator.name, 'Placement Cell') as student_name, u.roll_number, u.branch
       FROM interview_experiences ie
       LEFT JOIN users u ON ie.student_id = u.id
       LEFT JOIN users creator ON ie.created_by = creator.id
       ${where} ORDER BY ie.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    return { data: result.rows, total };
  },

  // Get all experiences (for coordinator)
  getAll: async ({ limit, offset }) => {
    const params = [];
    let paramCount = 1;

    const countResult = await query(
      `SELECT COUNT(*) FROM interview_experiences ie`
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT ie.*, COALESCE(u.name, creator.name, 'Placement Cell') as student_name, u.roll_number, u.branch
       FROM interview_experiences ie
       LEFT JOIN users u ON ie.student_id = u.id
       LEFT JOIN users creator ON ie.created_by = creator.id
       ORDER BY ie.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    return { data: result.rows, total };
  },

  // Get experience by id
  getById: async (id) => {
    const result = await query(
      `SELECT ie.*, COALESCE(u.name, creator.name, 'Placement Cell') as student_name, u.roll_number, u.branch
       FROM interview_experiences ie
       LEFT JOIN users u ON ie.student_id = u.id
       LEFT JOIN users creator ON ie.created_by = creator.id
       WHERE ie.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Create experience (coordinator)
  create: async ({ companyId, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks, createdBy }) => {
    const result = await query(
      `INSERT INTO interview_experiences (company_id, company_name, role_offered, batch_year, title, difficulty_level, interview_rounds, experience, preparation_tips, resources_links, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved') RETURNING *`,
      [companyId || null, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips || null, resourcesLinks || null, createdBy]
    );
    return result.rows[0];
  },

  // Update experience (coordinator)
  update: async (id, { companyId, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips, resourcesLinks }) => {
    const result = await query(
      `UPDATE interview_experiences 
       SET company_id=$1, company_name=$2, role_offered=$3, batch_year=$4, title=$5, difficulty_level=$6, interview_rounds=$7, experience=$8, preparation_tips=$9, resources_links=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [companyId || null, companyName, roleOffered, batchYear, title, difficultyLevel, interviewRounds, experience, preparationTips || null, resourcesLinks || null, id]
    );
    return result.rows[0];
  },

  // Delete experience
  delete: async (id) => {
    await query('DELETE FROM interview_experiences WHERE id = $1', [id]);
  },

  // Count total experiences
  count: async () => {
    const result = await query('SELECT COUNT(*) FROM interview_experiences');
    return parseInt(result.rows[0].count);
  },
};

module.exports = experienceService;
