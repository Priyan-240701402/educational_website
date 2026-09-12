const db = require('../config/database');
const AppError = require('../utils/AppError');

const safeFields = {
  universities: ['name', 'slug', 'logo', 'location', 'description', 'courses', 'official_website', 'status'],
  courses: ['university_id', 'name', 'slug', 'category', 'level', 'duration', 'eligibility', 'description', 'admission_info', 'official_source', 'source_url', 'last_verified_at', 'status', 'featured'],
  notifications: ['university_id', 'title', 'description', 'type', 'attachment', 'important', 'priority', 'is_new_badge', 'published', 'published_at', 'expiry_date', 'link'],
  gallery: ['university_id', 'title', 'description', 'image_url', 'category', 'views_count', 'likes_count', 'published', 'status'],
  enquiries: ['name', 'phone', 'email', 'university_id', 'course_id', 'message', 'source', 'status'],
  website_settings: ['institution_name', 'logo', 'phone', 'whatsapp', 'email', 'address', 'working_hours', 'maps_url', 'social_links'],
  about: ['who_we_are', 'mission', 'vision', 'services', 'disclaimer']
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function clean(table, body) {
  const fields = safeFields[table] || [];
  const cleaned = {};
  for (const key of fields) {
    if (Object.hasOwn(body, key) && body[key] !== undefined) {
      let val = body[key];
      if (typeof val === 'string' && val.trim() === '') {
        if (['university_id', 'course_id', 'expiry_date', 'last_verified_at'].includes(key)) {
          val = null;
        }
      }
      cleaned[key] = val;
    }
  }
  if ((table === 'universities' || table === 'courses') && cleaned.name && !cleaned.slug) {
    cleaned.slug = slugify(cleaned.name);
  }
  return cleaned;
}

function assignments(data, start = 1) {
  const keys = Object.keys(data);
  return {
    keys,
    values: Object.values(data),
    sql: keys.map((key, index) => `"${key}" = $${index + start}`).join(', ')
  };
}

async function list(table, options = {}) {
  const {
    id,
    slug,
    university_id,
    level,
    category,
    search,
    type,
    featured,
    status,
    includeUnpublished = false,
    page,
    limit,
    userIdentifier
  } = options;

  const prefix = { courses: 'c', notifications: 'n', enquiries: 'e', gallery: 'g', universities: 'u' }[table] || table;
  const values = [];
  const clauses = [];

  if (id) {
    values.push(id);
    clauses.push(`${prefix}.id = $${values.length}`);
  }

  if (slug) {
    values.push(slug);
    clauses.push(`${prefix}.slug = $${values.length}`);
  }

  if (university_id) {
    values.push(university_id);
    clauses.push(`${prefix}.university_id = $${values.length}`);
  }

  if (level) {
    values.push(level);
    clauses.push(`${prefix}.level = $${values.length}`);
  }

  if (category && category !== 'All') {
    values.push(category);
    clauses.push(`${prefix}.category = $${values.length}`);
  }

  if (type && type !== 'All') {
    values.push(type);
    clauses.push(`${prefix}.type = $${values.length}`);
  }

  if (typeof featured === 'boolean') {
    values.push(featured);
    clauses.push(`${prefix}.featured = $${values.length}`);
  }

  if (status && ['New', 'Contacted', 'In Progress', 'Converted', 'Closed'].includes(status)) {
    values.push(status);
    clauses.push(`${prefix}.status = $${values.length}`);
  }

  if (!includeUnpublished) {
    if (['universities', 'courses'].includes(table)) {
      clauses.push(`${prefix}.status = true`);
    }
    if (['notifications'].includes(table)) {
      clauses.push(`${prefix}.published = true`);
      clauses.push(`(${prefix}.expiry_date IS NULL OR ${prefix}.expiry_date > now())`);
    }
    if (['gallery'].includes(table)) {
      clauses.push(`${prefix}.published = true`);
      clauses.push(`${prefix}.status = true`);
    }
  }

  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    const sIdx = `$${values.length}`;
    if (table === 'courses') {
      clauses.push(`(lower(c.name) LIKE ${sIdx} OR lower(c.description) LIKE ${sIdx} OR lower(c.category) LIKE ${sIdx})`);
    } else if (table === 'universities') {
      clauses.push(`(lower(u.name) LIKE ${sIdx} OR lower(u.description) LIKE ${sIdx} OR lower(u.location) LIKE ${sIdx})`);
    } else if (table === 'notifications') {
      clauses.push(`(lower(n.title) LIKE ${sIdx} OR lower(n.description) LIKE ${sIdx})`);
    } else if (table === 'enquiries') {
      clauses.push(`(lower(e.name) LIKE ${sIdx} OR lower(e.phone) LIKE ${sIdx} OR lower(coalesce(e.email, '')) LIKE ${sIdx} OR lower(coalesce(e.message, '')) LIKE ${sIdx})`);
    } else if (table === 'gallery') {
      clauses.push(`(lower(g.title) LIKE ${sIdx} OR lower(coalesce(g.description, '')) LIKE ${sIdx} OR lower(coalesce(g.category, '')) LIKE ${sIdx})`);
    }
  }

  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';

  let join = '';
  let columns = `${prefix}.*`;
  let orderBy = `${prefix}.created_at DESC`;

  if (table === 'courses') {
    join = ' LEFT JOIN universities u ON u.id = c.university_id';
    columns = 'c.*, json_build_object(\'id\', u.id, \'name\', u.name, \'slug\', u.slug, \'logo\', u.logo) as university';
    orderBy = 'c.featured DESC, c.created_at DESC';
  } else if (table === 'notifications') {
    join = ' LEFT JOIN universities u ON u.id = n.university_id';
    columns = 'n.*, json_build_object(\'id\', u.id, \'name\', u.name, \'slug\', u.slug) as university';
    orderBy = 'n.priority DESC, n.published_at DESC';
  } else if (table === 'gallery') {
    join = ' LEFT JOIN universities u ON u.id = g.university_id';
    if (userIdentifier) {
      join += ` LEFT JOIN gallery_likes gl ON gl.gallery_id = g.id AND gl.user_identifier = '${userIdentifier.replace(/'/g, "''")}'`;
      columns = 'g.*, json_build_object(\'id\', u.id, \'name\', u.name) as university, (gl.id IS NOT NULL) as is_liked';
    } else {
      columns = 'g.*, json_build_object(\'id\', u.id, \'name\', u.name) as university, false as is_liked';
    }
    orderBy = 'g.created_at DESC';
  } else if (table === 'enquiries') {
    join = ' LEFT JOIN universities u ON u.id = e.university_id LEFT JOIN courses c ON c.id = e.course_id';
    columns = 'e.*, json_build_object(\'id\', u.id, \'name\', u.name) as university, json_build_object(\'id\', c.id, \'name\', c.name) as course';
    orderBy = 'e.created_at DESC';
  } else if (table === 'universities') {
    columns = 'u.*, (SELECT COUNT(*) FROM courses c WHERE c.university_id = u.id AND c.status = true) as active_courses_count';
    orderBy = 'u.name ASC';
  }

  // Handle single item retrieval
  if (id || slug) {
    const query = `SELECT ${columns} FROM ${table} ${prefix}${join}${where} LIMIT 1`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  // Handle pagination if requested
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const isPaginated = !isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0;

  if (isPaginated) {
    const countQuery = `SELECT COUNT(*) as total FROM ${table} ${prefix}${join}${where}`;
    const countRes = await db.query(countQuery, values);
    const totalItems = parseInt(countRes.rows[0].total, 10);
    const totalPages = Math.ceil(totalItems / limitNum) || 1;
    const offset = (pageNum - 1) * limitNum;

    values.push(limitNum);
    const limitIdx = `$${values.length}`;
    values.push(offset);
    const offsetIdx = `$${values.length}`;

    const dataQuery = `SELECT ${columns} FROM ${table} ${prefix}${join}${where} ORDER BY ${orderBy} LIMIT ${limitIdx} OFFSET ${offsetIdx}`;
    const dataRes = await db.query(dataQuery, values);

    return {
      items: dataRes.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages
      }
    };
  }

  // Unpaginated list
  const query = `SELECT ${columns} FROM ${table} ${prefix}${join}${where} ORDER BY ${orderBy}`;
  const result = await db.query(query, values);
  return result.rows;
}

async function create(table, body) {
  const data = clean(table, body);
  if (!Object.keys(data).length) {
    throw new AppError('No valid fields were supplied for creation.', 400);
  }
  const { keys, values } = assignments(data);
  const query = `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
}

async function update(table, id, body) {
  const data = clean(table, body);
  if (!Object.keys(data).length) {
    throw new AppError('No valid fields were supplied for update.', 400);
  }
  const { sql, values } = assignments(data);
  const query = `UPDATE ${table} SET ${sql}, updated_at = now() WHERE id = $${values.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);
  if (!result.rows[0]) {
    throw new AppError('Record not found.', 404);
  }
  return result.rows[0];
}

async function remove(table, id) {
  const result = await db.query(`DELETE FROM ${table} WHERE id = $1 RETURNING id`, [id]);
  if (!result.rows[0]) {
    throw new AppError('Record not found.', 404);
  }
  return result.rows[0];
}

// Atomic like/unlike toggle transaction for Gallery
async function toggleGalleryLike(galleryId, userIdentifier) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Check if gallery item exists
    const galCheck = await client.query('SELECT id, likes_count FROM gallery WHERE id = $1', [galleryId]);
    if (!galCheck.rows.length) {
      throw new AppError('Gallery item not found.', 404);
    }

    // Check if already liked by this user identifier
    const likeCheck = await client.query(
      'SELECT id FROM gallery_likes WHERE gallery_id = $1 AND user_identifier = $2',
      [galleryId, userIdentifier]
    );

    let liked = false;
    let newCount = galCheck.rows[0].likes_count;

    if (likeCheck.rows.length > 0) {
      // Unlike: remove like record and decrement count
      await client.query('DELETE FROM gallery_likes WHERE id = $1', [likeCheck.rows[0].id]);
      const updateRes = await client.query(
        'UPDATE gallery SET likes_count = GREATEST(0, likes_count - 1), updated_at = now() WHERE id = $1 RETURNING likes_count',
        [galleryId]
      );
      newCount = updateRes.rows[0].likes_count;
      liked = false;
    } else {
      // Like: insert like record and increment count
      await client.query(
        'INSERT INTO gallery_likes (gallery_id, user_identifier) VALUES ($1, $2)',
        [galleryId, userIdentifier]
      );
      const updateRes = await client.query(
        'UPDATE gallery SET likes_count = likes_count + 1, updated_at = now() WHERE id = $1 RETURNING likes_count',
        [galleryId]
      );
      newCount = updateRes.rows[0].likes_count;
      liked = true;
    }

    await client.query('COMMIT');
    return { liked, likes_count: newCount };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Increment view counter on gallery item
async function incrementGalleryView(galleryId) {
  try {
    await db.query('UPDATE gallery SET views_count = views_count + 1 WHERE id = $1', [galleryId]);
  } catch (err) {
    // Non-critical, ignore
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
  toggleGalleryLike,
  incrementGalleryView
};
