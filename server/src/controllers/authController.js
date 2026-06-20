const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userService = require('../services/userService');
const { sendPasswordResetEmail } = require('../services/emailService');
const { AppError } = require('../utils/appError');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, branch, cgpa, role } = req.body;

    // Security: coordinator accounts are admin-managed, never self-registered
    if (role && role === 'coordinator') {
      throw new AppError(
        'Coordinator accounts are managed by the Placement Cell Administrator. Please contact the Placement Cell for access.',
        403
      );
    }

    const existing = await userService.findByEmail(email);
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    // Role is always 'student' — never trust the client for role assignment
    const user = await userService.createUser({
      name,
      email,
      passwordHash,
      role: 'student',          // server-side enforced
      rollNumber: rollNumber || null,
      branch: branch || null,
      cgpa: cgpa || null,
      department: null,         // not applicable for public registration
      employeeId: null,
    });

    const { password_hash, ...safeUser } = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please log in using your credentials.',
      data: { user: safeUser },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      throw new AppError('Invalid email or password', 400);
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AppError('No account found with this email.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Incorrect password. Please try again.', 401);
    }

    // Role validation
    if (role && user.role !== role) {
      if (user.role === 'coordinator') {
        throw new AppError('❌ This account is registered as a Coordinator. Please use the Coordinator Login page.', 403);
      } else if (user.role === 'student') {
        throw new AppError('❌ This account is registered as a Student. Please use the Student Login page.', 403);
      } else {
        throw new AppError('❌ Please use the correct login portal.', 403);
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await userService.updateRefreshToken(user.id, refreshToken);

    const { password_hash, refresh_token, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await userService.findByRefreshToken(token);
    if (!user) throw new AppError('Invalid refresh token', 401);

    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    await userService.updateRefreshToken(user.id, newRefresh);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefresh },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await userService.updateRefreshToken(req.user.id, null);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log("Forgot password request received");
    console.log("Email:", email);
    if (!email) throw new AppError('Email is required', 400);

    // Validate email configuration is present
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    const hasEmailAuth = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
    if (!hasSmtp && !hasEmailAuth) {
      const configErr = new AppError('Email service is not configured on the server. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment.', 500);
      console.error("Email sending error: Email service is not configured on the server.");
      throw configErr;
    }

    // Always respond the same way — never reveal whether email exists (anti-enumeration)
    const GENERIC_MSG = 'If an account with that email exists, a password reset link has been sent.';

    const user = await userService.findByEmail(email);
    console.log("User found:", user?.email || null);
    if (!user) {
      return res.json({ success: true, message: GENERIC_MSG });
    }

    // Generate a secure raw token (URL-safe hex), hash it for DB storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    console.log("Reset token generated");

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await userService.storeResetToken(user.id, hashedToken, expiry);
    console.log("Reset token stored");

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({ to: user.email, userName: user.name, resetUrl });

    res.json({ success: true, message: GENERIC_MSG });
  } catch (err) {
    next(err);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) throw new AppError('Reset token is required', 400);
    if (!password || password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

    // Hash the incoming raw token and look it up
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userService.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Password reset link is invalid or has expired. Please request a new one.', 400);
    }

    const newPasswordHash = await bcrypt.hash(password, 12);

    // Update password and clear token atomically
    await userService.clearResetToken(user.id, newPasswordHash);

    // Invalidate all sessions by clearing refresh token
    await userService.updateRefreshToken(user.id, null);

    res.json({
      success: true,
      message: 'Password updated successfully. Please log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, generateTokens };
