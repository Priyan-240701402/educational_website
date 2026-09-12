const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
function authenticate(req, res, next) { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return next(new AppError('Authentication is required.', 401)); try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); } catch { next(new AppError('Your session is invalid or has expired.', 401)); } }
function authorize(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : next(new AppError('You do not have permission for this action.', 403)); }
module.exports = { authenticate, authorize };
