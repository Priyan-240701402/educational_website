const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');
const storage = multer.diskStorage({ destination: 'uploads/', filename: (req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`) });
const allowed = /jpeg|jpg|png|webp|pdf/;
module.exports = multer({ storage, limits:{ fileSize: 5 * 1024 * 1024 }, fileFilter:(req, file, callback) => allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype) ? callback(null, true) : callback(new AppError('Only JPG, PNG, WEBP and PDF uploads are allowed.', 400)) });
