const express = require('express');
const controller = require('../controllers/contentController');
const { authenticate, authorize } = require('../middleware/auth');

function contentRoutes(table, { publicCreate = false, publicRead = true } = {}) {
  const router = express.Router();
  const crud = controller.plural(table);

  // Special routes
  if (table === 'universities') {
    router.get('/:universityId/courses', controller.getUniversityCourses);
  }

  if (table === 'gallery') {
    router.post('/:id/like', controller.likeGallery);
  }

  // Public READ routes
  if (publicRead) {
    router.get('/', crud.list);
    router.get('/:id', crud.get);
  }

  // Public CREATE routes (e.g. enquiries)
  if (publicCreate) {
    router.post('/', crud.create);
  }

  // Protected Admin/Staff routes
  router.use(authenticate, authorize('ADMIN', 'STAFF'));

  // Admin READ routes if not public (e.g. enquiries listing for admins)
  if (!publicRead) {
    router.get('/', crud.list);
    router.get('/:id', crud.get);
  }

  // Admin CRUD routes
  router.post('/', crud.create);
  router.put('/:id', crud.update);
  router.patch('/:id', crud.update);
  router.delete('/:id', crud.remove);

  return router;
}

module.exports = { contentRoutes };
