require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function check() {
  try {
    // Test basic connection
    const ver = await pool.query('SELECT version()');
    console.log('✅ DB CONNECTED:', ver.rows[0].version);

    // List tables
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    if (tables.rows.length === 0) {
      console.log('⚠️  NO TABLES FOUND — database schema not initialised yet');
    } else {
      console.log(`✅ TABLES (${tables.rows.length}):`, tables.rows.map(r => r.table_name).join(', '));
    }

    // Check row counts for key tables
    const keyTables = ['admins','universities','courses','website_settings','enquiries','notifications','gallery','about'];
    for (const t of keyTables) {
      try {
        const cnt = await pool.query(`SELECT COUNT(*) FROM ${t}`);
        console.log(`   📋 ${t}: ${cnt.rows[0].count} row(s)`);
      } catch (e) {
        console.log(`   ❌ ${t}: table missing or error — ${e.message}`);
      }
    }
  } catch (err) {
    console.log('❌ DB CONNECTION FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

check();
