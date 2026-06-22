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
  console.log('[OAuth Start] GET /auth/google hit.');
  console.log('[OAuth Start] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set' : 'NOT set');
  console.log('[OAuth Start] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  console.log('[OAuth Start] CLIENT_URL:', process.env.CLIENT_URL);
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const target = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`;
    console.log('[OAuth Start] Credentials missing. Redirecting to:', target);
    return res.redirect(target);
  }
  console.log('[OAuth Start] Triggering passport.authenticate("google")...');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback',
  (req, res, next) => {
    console.log('[OAuth Callback] GET /auth/google/callback hit.');
    console.log('[OAuth Callback] Full original URL:', req.originalUrl);
    console.log('[OAuth Callback] Query parameters:', JSON.stringify(req.query));
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const target = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`;
      console.log('[OAuth Callback] Credentials missing. Redirecting to:', target);
      return res.redirect(target);
    }
    const failureTarget = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`;
    console.log('[OAuth Callback] Triggering passport.authenticate("google") callback verification...');
    passport.authenticate('google', { 
      failureRedirect: failureTarget, 
      session: false 
    }, (err, user, info) => {
      if (err) {
        console.error('[OAuth Callback] Passport verification error:', err);
        return res.redirect(failureTarget);
      }
      if (!user) {
        console.log('[OAuth Callback] Passport authentication failed. Info:', info);
        return res.redirect(failureTarget);
      }
      console.log('[OAuth Callback] Passport authentication success! Logged-in User:', user.email);
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('[OAuth Callback Success] Generating tokens for user:', req.user ? req.user.email : 'undefined');
      const { accessToken, refreshToken } = generateTokens(req.user);
      const userService = require('./services/userService');
      await userService.updateRefreshToken(req.user.id, refreshToken);
      const target = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${accessToken}&refreshToken=${refreshToken}`;
      console.log('[OAuth Callback Success] Redirecting user to frontend target:', target);
      res.redirect(target);
    } catch (err) {
      console.error('[OAuth Callback Success Error] Google OAuth callback error:', err.message);
      const target = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`;
      res.redirect(target);
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
