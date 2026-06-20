const { query } = require('../database/db');

const companyService = {
  // Get all companies with filters, search, pagination
  getAll: async ({ search, minPackage, maxPackage, role, sortBy, sortOrder, limit, offset }) => {
    let conditions = ['is_active = TRUE'];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(name ILIKE $${paramCount} OR role_offered ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (minPackage !== undefined) {
      conditions.push(`package_lpa >= $${paramCount}`);
      params.push(minPackage);
      paramCount++;
    }
    if (maxPackage !== undefined) {
      conditions.push(`package_lpa <= $${paramCount}`);
      params.push(maxPackage);
      paramCount++;
    }
    if (role) {
      conditions.push(`role_offered ILIKE $${paramCount}`);
      params.push(`%${role}%`);
      paramCount++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const countResult = await query(`SELECT COUNT(*) FROM companies ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const validSortFields = ['name', 'package_lpa', 'visit_date', 'application_deadline', 'created_at'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'visit_date';
    const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM companies ${where}
       ORDER BY ${orderField} ${orderDir}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );
    return { data: result.rows, total };
  },

  // Get company by id
  getById: async (id) => {
    const result = await query('SELECT * FROM companies WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Create company
  create: async ({ name, logoUrl, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, jdPdfUrl, createdBy, applicationLink }) => {
    const result = await query(
      `INSERT INTO companies (name, logo_url, role_offered, package_lpa, eligibility_cgpa, visit_date, application_deadline, description, hiring_process, jd_pdf_url, created_by, application_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, logoUrl, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, jdPdfUrl, createdBy, applicationLink || null]
    );
    return result.rows[0];
  },

  // Update company
  update: async (id, { name, logoUrl, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, jdPdfUrl, applicationLink }) => {
    const result = await query(
      `UPDATE companies SET name=$1, logo_url=$2, role_offered=$3, package_lpa=$4, eligibility_cgpa=$5,
       visit_date=$6, application_deadline=$7, description=$8, hiring_process=$9, jd_pdf_url=$10, application_link=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [name, logoUrl, roleOffered, packageLpa, eligibilityCgpa, visitDate, applicationDeadline, description, hiringProcess, jdPdfUrl, applicationLink || null, id]
    );
    return result.rows[0];
  },

  // Delete company (soft delete)
  delete: async (id) => {
    await query('UPDATE companies SET is_active = FALSE, updated_at = NOW() WHERE id = $1', [id]);
  },

  // Count active companies
  count: async () => {
    const result = await query('SELECT COUNT(*) FROM companies WHERE is_active = TRUE');
    return parseInt(result.rows[0].count);
  },

  // Count upcoming companies (visit_date >= today, and not expired)
  countUpcoming: async () => {
    const result = await query("SELECT COUNT(*) FROM companies WHERE is_active = TRUE AND application_deadline >= CURRENT_DATE");
    return parseInt(result.rows[0].count);
  },

  // Get eligible companies count for a student (by cgpa, and not expired)
  countEligibleForStudent: async (cgpa) => {
    const result = await query(
      'SELECT COUNT(*) FROM companies WHERE is_active = TRUE AND eligibility_cgpa <= $1 AND application_deadline >= CURRENT_DATE',
      [cgpa]
    );
    return parseInt(result.rows[0].count);
  },

  // Get upcoming drives (not expired)
  getUpcoming: async (limit = 5) => {
    const result = await query(
      `SELECT id, name, logo_url, role_offered, package_lpa, visit_date, eligibility_cgpa, application_deadline, application_link
       FROM companies WHERE is_active = TRUE AND application_deadline >= CURRENT_DATE
       ORDER BY visit_date ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  // Get drives closing soon
  getClosingSoon: async (limit = 5) => {
    const result = await query(
      `SELECT id, name, logo_url, role_offered, package_lpa, visit_date, eligibility_cgpa, application_deadline, application_link
       FROM companies WHERE is_active = TRUE AND application_deadline >= CURRENT_DATE
       ORDER BY application_deadline ASC LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  // Get eligible companies list
  getEligibleListForStudent: async (cgpa, limit = 5) => {
    const result = await query(
      `SELECT id, name, logo_url, role_offered, package_lpa, visit_date, eligibility_cgpa, application_deadline, application_link
       FROM companies WHERE is_active = TRUE AND eligibility_cgpa <= $1 AND application_deadline >= CURRENT_DATE
       ORDER BY application_deadline ASC LIMIT $2`,
      [cgpa, limit]
    );
    return result.rows;
  },

  // Get placement statistics
  getPlacementStats: async () => {
    const statsResult = await query(
      `SELECT 
         MAX(package_lpa)::FLOAT as max_package, 
         AVG(package_lpa)::FLOAT as avg_package,
         MIN(package_lpa)::FLOAT as min_package,
         COUNT(*)::INT as total_drives
       FROM companies WHERE is_active = TRUE`
    );
    const distributionResult = await query(
      `SELECT
        CASE
          WHEN package_lpa < 5 THEN '< 5 LPA'
          WHEN package_lpa BETWEEN 5 AND 10 THEN '5-10 LPA'
          WHEN package_lpa BETWEEN 10 AND 20 THEN '10-20 LPA'
          ELSE '> 20 LPA'
        END as range,
        COUNT(*)::INT as count
       FROM companies WHERE is_active = TRUE
       GROUP BY range ORDER BY range`
    );
    return {
      minPackage: statsResult.rows[0].min_package || 0,
      maxPackage: statsResult.rows[0].max_package || 0,
      avgPackage: Math.round((statsResult.rows[0].avg_package || 0) * 100) / 100,
      totalDrives: statsResult.rows[0].total_drives || 0,
      distribution: distributionResult.rows,
    };
  },

  // Package distribution for analytics (coordinator)
  getPackageDistribution: async () => {
    const result = await query(
      `SELECT
        CASE
          WHEN package_lpa < 5 THEN '< 5 LPA'
          WHEN package_lpa BETWEEN 5 AND 10 THEN '5-10 LPA'
          WHEN package_lpa BETWEEN 10 AND 20 THEN '10-20 LPA'
          ELSE '> 20 LPA'
        END as range,
        COUNT(*) as count
       FROM companies WHERE is_active = TRUE
       GROUP BY range ORDER BY range`
    );
    return result.rows;
  },
};

module.exports = companyService;
