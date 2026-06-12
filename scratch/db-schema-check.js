require('dotenv').config({ path: 'server/.env' });
const { query } = require('../server/src/config/database');

async function run() {
  try {
    const tablesRes = await query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log("TABLES IN DB:");
    console.log(tablesRes.rows.map(r => r.table_name));

    for (const row of tablesRes.rows) {
      const columnsRes = await query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [row.table_name]);
      console.log(`\nTABLE: ${row.table_name}`);
      console.log(columnsRes.rows.map(c => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
