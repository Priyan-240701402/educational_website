require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { contentRoutes } = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is operational',
    data: { service: 'distance-education-portal', timestamp: new Date().toISOString() }
  });
});

// Specific Rate limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiry submissions from this connection. Please try again shortly.' }
});

const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded for liking.' }
});

// Route registration
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/uploads', uploadRoutes);

// Universities & Courses
app.use('/api/universities', contentRoutes('universities'));
app.use('/api/courses', contentRoutes('courses'));

// Notifications
app.use('/api/notifications', contentRoutes('notifications'));

// Gallery with like limiter applied specifically
app.use('/api/gallery/:id/like', likeLimiter);
app.use('/api/gallery', contentRoutes('gallery'));

// Enquiries (Public POST, Admin GET/UPDATE/DELETE)
app.use('/api/enquiries', enquiryLimiter, contentRoutes('enquiries', { publicCreate: true, publicRead: false }));

// Settings & About
app.use('/api/settings', settingsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
