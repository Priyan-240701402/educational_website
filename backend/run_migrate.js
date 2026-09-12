require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function fixMissingTables() {
  try {
    console.log('Creating missing tables with IF NOT EXISTS...\n');

    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await pool.query(`CREATE TABLE IF NOT EXISTS universities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(180) UNIQUE NOT NULL,
      logo TEXT,
      location VARCHAR(160),
      description TEXT NOT NULL,
      courses TEXT,
      status BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ universities');

    await pool.query(`CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      university_id UUID REFERENCES universities(id) ON DELETE RESTRICT NOT NULL,
      name VARCHAR(220) NOT NULL,
      category VARCHAR(100) NOT NULL,
      level VARCHAR(40) NOT NULL CHECK(level IN ('Undergraduate','Postgraduate','Diploma','Certificate')),
      duration VARCHAR(80) NOT NULL,
      eligibility TEXT NOT NULL,
      description TEXT NOT NULL,
      status BOOLEAN NOT NULL DEFAULT true,
      featured BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(university_id, name)
    )`);
    console.log('✅ courses');

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(50) NOT NULL CHECK(type IN ('Admission','Examination','Hall Ticket','Assignment','Results','General')),
      attachment TEXT,
      important BOOLEAN NOT NULL DEFAULT false,
      published BOOLEAN NOT NULL DEFAULT false,
      published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ notifications');

    await pool.query(`CREATE TABLE IF NOT EXISTS gallery (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(180) NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category VARCHAR(80) NOT NULL,
      published BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ gallery');

    await pool.query(`CREATE TABLE IF NOT EXISTS enquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(160) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      email VARCHAR(180),
      university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
      course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'New' CHECK(status IN ('New','Contacted','Resolved')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ enquiries');

    await pool.query(`CREATE TABLE IF NOT EXISTS website_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_name VARCHAR(180) NOT NULL,
      logo TEXT,
      phone VARCHAR(30),
      whatsapp VARCHAR(30),
      email VARCHAR(180),
      address TEXT,
      working_hours VARCHAR(160),
      maps_url TEXT,
      social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ website_settings');

    await pool.query(`CREATE TABLE IF NOT EXISTS about (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      who_we_are TEXT NOT NULL,
      mission TEXT NOT NULL,
      vision TEXT NOT NULL,
      services TEXT NOT NULL,
      disclaimer TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    console.log('✅ about');

    // Indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS courses_university_id_idx ON courses(university_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS notifications_public_idx ON notifications(published, published_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries(status)`);
    console.log('✅ indexes');

    console.log('\n🎉 All tables created successfully! Now seeding...\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

fixMissingTables();
