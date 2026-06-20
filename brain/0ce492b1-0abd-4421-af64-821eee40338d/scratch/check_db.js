require('dotenv').config({ path: 'c:\\Users\\bhara\\OneDrive\\Desktop\\placementhub\\server\\.env' });
const { query, pool } = require('c:\\Users\\bhara\\OneDrive\\Desktop\\placementhub\\server\\src\\database\\db');

async function main() {
  try {
    const result = await query('SELECT id, name, email, role, roll_number, branch, cgpa FROM users');
    console.log('Users in database:', result.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
