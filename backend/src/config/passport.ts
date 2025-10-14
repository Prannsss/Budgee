import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            where: {
              oauth_provider: 'google',
              oauth_id: profile.id,
            },
          });

          if (!user) {
            // Check if email already exists
            const existingUser = await User.findOne({
              where: { email: profile.emails?.[0]?.value },
            });

            if (existingUser) {
              // Link Google account to existing user
              await existingUser.update({
                oauth_provider: 'google',
                oauth_id: profile.id,
                email_verified: true, // Email is verified by Google
              });
              user = existingUser;
            } else {
              // Create new user
              user = await User.create({
                name: profile.displayName || profile.emails?.[0]?.value.split('@')[0] || 'User',
                email: profile.emails?.[0]?.value!,
                password_hash: '', // No password for OAuth users
                plan_id: 1, // Free plan
                oauth_provider: 'google',
                oauth_id: profile.id,
                email_verified: true,
                avatar_url: profile.photos?.[0]?.value,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            where: {
              oauth_provider: 'facebook',
              oauth_id: profile.id,
            },
          });

          if (!user) {
            // Check if email already exists
            const existingUser = await User.findOne({
              where: { email: profile.emails?.[0]?.value },
            });

            if (existingUser) {
              // Link Facebook account to existing user
              await existingUser.update({
                oauth_provider: 'facebook',
                oauth_id: profile.id,
                email_verified: true, // Email is verified by Facebook
              });
              user = existingUser;
            } else {
              // Create new user
              user = await User.create({
                name: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'User',
                email: profile.emails?.[0]?.value!,
                password_hash: '', // No password for OAuth users
                plan_id: 1, // Free plan
                oauth_provider: 'facebook',
                oauth_id: profile.id,
                email_verified: true,
                avatar_url: profile.photos?.[0]?.value,
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Serialize and deserialize user for session support (optional)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
