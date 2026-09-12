require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../../database/schema/003_comprehensive_enhancements.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Running migration 003_comprehensive_enhancements.sql...');
    await pool.query(sql);
    console.log('✅ Migration executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
