const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/userService');

// We will only configure the Google Strategy if credentials are provided in env.
// This prevents application crash if they are not yet set up.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(null, false, { message: 'No email found in Google profile' });
          }

          // 1. Try to find user by google_id
          let user = await userService.findByGoogleId(profile.id);

          // 2. If not found, try to find user by email to link
          if (!user) {
            user = await userService.findByEmail(email);
            if (user) {
              user = await userService.linkGoogleAccount(user.id, profile.id);
            } else {
              // 3. Create new user with role 'student' (coordinator is blocked)
              user = await userService.createUser({
                name: profile.displayName || email.split('@')[0],
                email: email,
                passwordHash: null,
                role: 'student', // default role = student, coordinator accounts are never created via Google OAuth
                rollNumber: null,
                branch: null,
                cgpa: null,
                department: null,
                employeeId: null,
                googleId: profile.id,
                authProvider: 'google',
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
