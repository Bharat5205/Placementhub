const { pool } = require('./src/database/db.js');
const fs = require('fs');

async function dump() {
  const result = {};
  try {
    const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    for (const row of tablesRes.rows) {
      const table = row.table_name;
      const colsRes = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      result[table] = colsRes.rows;
    }
    fs.writeFileSync('schema_dump.json', JSON.stringify(result, null, 2));
    console.log('Schema dumped to schema_dump.json');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
dump();
