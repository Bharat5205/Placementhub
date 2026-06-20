require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const notificationRoutes = require('./routes/notification.routes');
const experienceRoutes = require('./routes/experience.routes');
const studentRoutes = require('./routes/student.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const session = require('express-session');
const passport = require('./utils/passport');
const { generateTokens } = require('./controllers/authController');

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'placementhub_session_secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth endpoints
app.get('/auth/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`, session: false })(req, res, next);
  },
  async (req, res) => {
    try {
      const { accessToken, refreshToken } = generateTokens(req.user);
      const userService = require('./services/userService');
      await userService.updateRefreshToken(req.user.id, refreshToken);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
      console.error('Google OAuth callback error:', err.message);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  }
);

// ─── Security & Middleware ───────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static file serving (uploads) ──────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CRMS API is running', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/users', studentRoutes);

// ─── 404 Handler ─────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CRMS Server running on http://localhost:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'crms_db'} @ ${process.env.DB_HOST || 'localhost'}\n`);
});

module.exports = app;
