const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/userService');

// We will only configure the Google Strategy if credentials are provided in env.
// This prevents application crash if they are not yet set up.
const rawClientID = process.env.GOOGLE_CLIENT_ID || '';
const rawClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const rawCallbackURL = process.env.GOOGLE_CALLBACK_URL || '';

if (rawClientID.trim() && rawClientSecret.trim()) {
  const clientID = rawClientID.trim();
  const clientSecret = rawClientSecret.trim();
  const callbackURL = rawCallbackURL.trim() || 'http://localhost:5000/auth/google/callback';
  
  const maskedSecret = clientSecret.length >= 20 
    ? `${clientSecret.slice(0, 10)}...${clientSecret.slice(-10)}` 
    : 'secret_too_short';
    
  console.log('[Passport Google] Initializing Google Strategy.');
  console.log('[Passport Google] GOOGLE_CLIENT_ID used at runtime:', clientID);
  console.log('[Passport Google] GOOGLE_CLIENT_SECRET (first/last 10):', maskedSecret);
  console.log('[Passport Google] GOOGLE_CALLBACK_URL used at runtime:', callbackURL);
  console.log('[Passport Google] CLIENT_URL used at runtime:', process.env.CLIENT_URL);
  console.log('[Passport Google] Passport Google Strategy callbackURL:', callbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('[Passport Google Callback] Verify function triggered (Passport callback execution).');
        console.log('[Passport Google Callback] Received profile (Google profile received):', JSON.stringify(profile));
        console.log('[Passport Google Callback] Received profile ID:', profile.id);
        console.log('[Passport Google Callback] Received profile displayName:', profile.displayName);
        try {
          const email = profile.emails?.[0]?.value;
          console.log('[Passport Google Callback] Received email:', email);
          if (!email) {
            console.log('[Passport Google Callback] No email found in Google profile');
            return done(null, false, { message: 'No email found in Google profile' });
          }

          // 1. Try to find user by google_id
          let user = await userService.findByGoogleId(profile.id);
          if (user) {
            console.log('[Passport Google Callback] User found by Google ID:', user.email);
          }

          // 2. If not found, try to find user by email to link
          if (!user) {
            console.log('[Passport Google Callback] User not found by Google ID. Checking email:', email);
            user = await userService.findByEmail(email);
            if (user) {
              console.log('[Passport Google Callback] Existing user found by email. Linking Google account ID:', profile.id);
              user = await userService.linkGoogleAccount(user.id, profile.id);
            } else {
              // 3. Create new user with role 'student' (coordinator is blocked)
              console.log('[Passport Google Callback] No existing user. Creating new student account.');
              user = await userService.createUser({
                name: profile.displayName || email.split('@')[0],
                email: email,
                passwordHash: null,
                role: 'student', // default role = student
                rollNumber: null,
                branch: null,
                cgpa: null,
                department: null,
                employeeId: null,
                googleId: profile.id,
                authProvider: 'google',
              });
              console.log('[Passport Google Callback] New user created successfully:', user.email);
            }
          }

          console.log('[Passport Google Callback] Authentication successful for user:', user.email);
          return done(null, user);
        } catch (err) {
          console.error('[Passport Google Callback] Error in verify callback:', err);
          return done(err);
        }
      }
    )
  );
} else {
  console.log('[Passport Google] Google credentials missing. Strategy NOT initialized.');
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
