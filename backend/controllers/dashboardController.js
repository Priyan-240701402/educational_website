const db = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const query = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM courses) AS courses,
      (SELECT COUNT(*) FROM universities) AS universities,
      (SELECT COUNT(*) FROM notifications) AS notifications,
      (SELECT COUNT(*) FROM gallery) AS gallery,
      (SELECT COUNT(*) FROM enquiries WHERE status = 'New') AS "newEnquiries",
      (SELECT COUNT(*) FROM enquiries) AS "totalEnquiries"
  `);
  res.json({
    success: true,
    message: 'Dashboard loaded',
    data: query.rows[0]
  });
});
