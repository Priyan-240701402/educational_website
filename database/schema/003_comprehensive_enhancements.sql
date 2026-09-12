-- Migration 003: Comprehensive Enhancements for Distance Education Guidance Portal

-- 1. Enhance universities table
ALTER TABLE universities ADD COLUMN IF NOT EXISTS slug VARCHAR(200);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS official_website TEXT;
UPDATE universities SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;
ALTER TABLE universities ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS universities_slug_idx ON universities(slug);

-- 2. Enhance courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug VARCHAR(240);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS admission_info TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS official_source VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT now();
UPDATE courses SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) WHERE slug IS NULL;

-- 3. Enhance notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_new_badge BOOLEAN DEFAULT true;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- 4. Enhance gallery table & create gallery_likes
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE SET NULL;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS status BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS gallery_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID REFERENCES gallery(id) ON DELETE CASCADE NOT NULL,
  user_identifier VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gallery_id, user_identifier)
);

-- 5. Enhance enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS source VARCHAR(60) DEFAULT 'website_popup';
-- Update status check constraint if needed
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
ALTER TABLE enquiries ADD CONSTRAINT enquiries_status_check CHECK (status IN ('New', 'Contacted', 'In Progress', 'Converted', 'Closed'));

-- 6. Indexes for scalability & high-concurrency queries
CREATE INDEX IF NOT EXISTS universities_status_idx ON universities(status);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS courses_university_status_idx ON courses(university_id, status);
CREATE INDEX IF NOT EXISTS notifications_priority_idx ON notifications(published, priority DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS gallery_published_idx ON gallery(published, status, created_at DESC);
CREATE INDEX IF NOT EXISTS gallery_likes_lookup_idx ON gallery_likes(gallery_id, user_identifier);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries(created_at DESC);
