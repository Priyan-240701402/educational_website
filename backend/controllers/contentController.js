const model = require('../services/contentService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const send = (res, data, message = 'Success', status = 200, extra = {}) => {
  if (status === 204) {
    return res.status(204).end();
  }
  return res.status(status).json({
    success: true,
    message,
    data,
    ...extra
  });
};

function getClientIdentifier(req) {
  // Use custom client id header, authorization user, or hashed IP + User-Agent
  return req.headers['x-client-id'] ||
    (req.user ? `user_${req.user.id}` : null) ||
    req.ip ||
    'anonymous_client';
}

const plural = (table) => ({
  list: asyncHandler(async (req, res) => {
    const { page, limit, university, university_id, level, category, search, type, featured, status } = req.query;
    const userIdentifier = getClientIdentifier(req);

    const result = await model.list(table, {
      university_id: university_id || university,
      level,
      category,
      search,
      type,
      featured: featured !== undefined ? featured === 'true' : undefined,
      status,
      includeUnpublished: Boolean(req.user),
      page,
      limit,
      userIdentifier
    });

    if (result && result.pagination) {
      return send(res, result.items, 'Success', 200, { pagination: result.pagination });
    }

    return send(res, result);
  }),

  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const userIdentifier = getClientIdentifier(req);

    const item = await model.list(table, {
      id: isUUID ? id : undefined,
      slug: !isUUID ? id : undefined,
      includeUnpublished: Boolean(req.user),
      userIdentifier
    });

    if (!item) {
      throw new AppError('Record not found.', 404);
    }

    if (table === 'gallery') {
      model.incrementGalleryView(item.id);
    }

    return send(res, item);
  }),

  create: asyncHandler(async (req, res) => {
    // Basic validation
    if (table === 'enquiries') {
      if (!req.body.name || !req.body.phone) {
        throw new AppError('Name and mobile number are required.', 422);
      }
    } else if (table === 'universities') {
      if (!req.body.name) throw new AppError('University name is required.', 422);
    } else if (table === 'courses') {
      if (!req.body.name || !req.body.university_id) throw new AppError('Course name and university are required.', 422);
    } else if (table === 'notifications') {
      if (!req.body.title || !req.body.description) throw new AppError('Title and description are required.', 422);
    } else if (table === 'gallery') {
      if (!req.body.image_url || !req.body.title) throw new AppError('Image and title are required.', 422);
    }

    const created = await model.create(table, req.body);
    const entityName = table === 'gallery' ? 'Gallery image' : table === 'enquiries' ? 'Enquiry' : table.slice(0, -1);
    return send(res, created, `${entityName} created successfully`, 201);
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await model.update(table, id, req.body);
    const entityName = table === 'gallery' ? 'Gallery image' : table === 'enquiries' ? 'Enquiry' : table.slice(0, -1);
    return send(res, updated, `${entityName} updated successfully`, 200);
  }),

  remove: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await model.remove(table, id);
    const entityName = table === 'gallery' ? 'Gallery image' : table === 'enquiries' ? 'Enquiry' : table.slice(0, -1);
    return send(res, { id }, `${entityName} deleted successfully`, 200);
  })
});

// Get courses by university
const getUniversityCourses = asyncHandler(async (req, res) => {
  const { universityId } = req.params;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(universityId);

  let uniId = universityId;
  if (!isUUID) {
    const uni = await model.list('universities', { slug: universityId });
    if (!uni) throw new AppError('University not found.', 404);
    uniId = uni.id;
  }

  const { level, category, search, page, limit } = req.query;
  const result = await model.list('courses', {
    university_id: uniId,
    level,
    category,
    search,
    includeUnpublished: Boolean(req.user),
    page,
    limit
  });

  if (result && result.pagination) {
    return send(res, result.items, 'Success', 200, { pagination: result.pagination });
  }
  return send(res, result);
});

// Like / Unlike toggle for Gallery
const likeGallery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userIdentifier = getClientIdentifier(req);

  if (!userIdentifier) {
    throw new AppError('Client identification required to like.', 400);
  }

  const result = await model.toggleGalleryLike(id, userIdentifier);
  return send(res, result, result.liked ? 'Gallery item liked' : 'Gallery item unliked', 200);
});

// Settings & About handlers
const publicSettings = asyncHandler(async (req, res) => {
  const settings = (await model.list('website_settings', { includeUnpublished: true }))[0] || {};
  return send(res, settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const current = (await model.list('website_settings', { includeUnpublished: true }))[0];
  const saved = current
    ? await model.update('website_settings', current.id, req.body)
    : await model.create('website_settings', req.body);
  return send(res, saved, 'Settings saved successfully');
});

const publicAbout = asyncHandler(async (req, res) => {
  const about = (await model.list('about', { includeUnpublished: true }))[0] || {};
  return send(res, about);
});

const updateAbout = asyncHandler(async (req, res) => {
  const current = (await model.list('about', { includeUnpublished: true }))[0];
  const saved = current
    ? await model.update('about', current.id, req.body)
    : await model.create('about', req.body);
  return send(res, saved, 'About content saved successfully');
});

module.exports = {
  plural,
  getUniversityCourses,
  likeGallery,
  publicSettings,
  updateSettings,
  publicAbout,
  updateAbout,
  send
};
