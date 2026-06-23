require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./db');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create default coordinator
    const coordinatorPassword = await bcrypt.hash('coordinator123', 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'coordinator')
       ON CONFLICT (email) DO NOTHING`,
      ['Admin Coordinator', 'coordinator@crms.edu', coordinatorPassword]
    );
    console.log('✅ Coordinator created: coordinator@crms.edu / coordinator123');

    // Create a sample student
    const studentPassword = await bcrypt.hash('student123', 12);
    await query(
      `INSERT INTO users (name, email, password_hash, role, roll_number, branch, cgpa)
       VALUES ($1, $2, $3, 'student', $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['John Doe', 'student@college.edu', studentPassword, '21CSE001', 'CSE', 8.5]
    );
    console.log('✅ Sample student created: student@college.edu / student123');

    // Create sample companies
    const companies = [
      { name: 'Google', logo: 'google.svg', role: 'Software Engineer', pkg: 25.0, cgpa: 8.0, visit: '2026-08-15', deadline: '2026-07-31', desc: 'Google LLC is an American multinational technology company.', hiring: 'Online Test → 2 Technical Interviews → HR' },
      { name: 'Microsoft', logo: 'microsoft.svg', role: 'SDE-1', pkg: 20.0, cgpa: 7.5, visit: '2026-09-01', deadline: '2026-08-15', desc: 'Microsoft Corporation is an American multinational technology company.', hiring: 'Coding Test → 3 Technical Rounds → HR' },
      { name: 'Amazon', logo: 'amazon.svg', role: 'SDE-1', pkg: 18.0, cgpa: 7.0, visit: '2026-09-15', deadline: '2026-09-01', desc: 'Amazon.com is an American multinational technology company.', hiring: 'OA → 2 Technical → Bar Raiser → HR' },
      { name: 'D. E. Shaw', logo: 'deshaw.svg', role: 'Software Development Engineer', pkg: 35.0, cgpa: 8.5, visit: '2026-08-20', deadline: '2026-08-05', desc: 'D. E. Shaw & Co. is a global investment and technology development firm.', hiring: 'Aptitude & Coding Test → 3 Technical Interviews → HR Round' },
      { name: 'Infosys', logo: 'infosys.svg', role: 'Systems Engineer', pkg: 3.6, cgpa: 6.0, visit: '2026-07-20', deadline: '2026-07-10', desc: 'Infosys Limited is an Indian multinational information technology company.', hiring: 'Written Test → HR' },
      { name: 'TCS', logo: 'tcs.svg', role: 'Assistant System Engineer', pkg: 3.36, cgpa: 6.0, visit: '2026-07-25', deadline: '2026-07-15', desc: 'Tata Consultancy Services is an Indian multinational IT services company.', hiring: 'TCS NQT → Technical → HR' },
    ];

    for (const c of companies) {
      await query(
        `INSERT INTO companies (name, logo_url, role_offered, package_lpa, eligibility_cgpa, visit_date, application_deadline, description, hiring_process)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
        [c.name, c.logo, c.role, c.pkg, c.cgpa, c.visit, c.deadline, c.desc, c.hiring]
      );
    }
    console.log('✅ Sample companies created');

    // Create sample notifications
    const notifications_data = [
      { title: 'Google Drive Announced!', msg: 'Google will be visiting campus on August 15th for SWE roles. Package: 25 LPA', priority: 'high' },
      { title: 'Resume Submission Deadline', msg: 'Please submit your updated resumes by June 30th for the upcoming placement season.', priority: 'medium' },
      { title: 'Pre-Placement Talk - Microsoft', msg: 'Microsoft will conduct a pre-placement talk on September 1st at 10 AM in the main auditorium.', priority: 'medium' },
      { title: 'Mock Interview Sessions', msg: 'Register for mock interview sessions being conducted by the placement cell.', priority: 'low' },
    ];

    for (const n of notifications_data) {
      const existing = await query('SELECT id FROM notifications WHERE title = $1', [n.title]);
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO notifications (title, message, priority) VALUES ($1, $2, $3)`,
          [n.title, n.msg, n.priority]
        );
      }
    }
    console.log('✅ Sample notifications created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('  Coordinator: coordinator@crms.edu / coordinator123');
    console.log('  Student:     student@college.edu  / student123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
