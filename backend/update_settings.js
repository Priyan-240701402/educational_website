require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function updateSettings() {
  try {
    const result = await pool.query(
      `UPDATE website_settings SET
        phone = $1,
        whatsapp = $2,
        email = $3,
        address = $4,
        institution_name = $5,
        maps_url = $6,
        updated_at = now()`,
      [
        '+91 94424 08960',
        '919442408960',
        'majoreducationalstudycentre@gmail.com',
        '161, Town Hall 1st St, opposite Government Hospital, Arakkonam, Tamil Nadu 631001, India',
        'Major Educational Institution',
        'https://maps.google.com/?q=161+Town+Hall+1st+St+Arakkonam+Tamil+Nadu+631001'
      ]
    );
    console.log('✅ website_settings updated, rows affected:', result.rowCount);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateSettings();
