import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { supabase } from './supabase';
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
          // Check if user already exists with Google OAuth
          const { data: existingOauthUser } = await supabase
            .from('users')
            .select('*')
            .eq('oauth_provider', 'google')
            .eq('oauth_id', profile.id)
            .single();

          if (existingOauthUser) {
            return done(null, existingOauthUser);
          }

          // Check if email already exists
          const { data: existingEmailUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', profile.emails?.[0]?.value)
            .single();

          if (existingEmailUser) {
            // Link Google account to existing user
            const { data: updatedUser } = await supabase
              .from('users')
              .update({
                oauth_provider: 'google',
                oauth_id: profile.id,
                email_verified: true, // Email is verified by Google
              })
              .eq('id', existingEmailUser.id)
              .select()
              .single();

            return done(null, updatedUser || existingEmailUser);
          }

          // Create new user
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              name: profile.displayName || profile.emails?.[0]?.value.split('@')[0] || 'User',
              email: profile.emails?.[0]?.value!,
              password_hash: '', // No password for OAuth users
              plan_id: 1, // Free plan
              oauth_provider: 'google',
              oauth_id: profile.id,
              email_verified: true,
              avatar_url: profile.photos?.[0]?.value,
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          return done(null, newUser);
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
          // Check if user already exists with Facebook OAuth
          const { data: existingOauthUser } = await supabase
            .from('users')
            .select('*')
            .eq('oauth_provider', 'facebook')
            .eq('oauth_id', profile.id)
            .single();

          if (existingOauthUser) {
            return done(null, existingOauthUser);
          }

          // Check if email already exists
          const { data: existingEmailUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', profile.emails?.[0]?.value)
            .single();

          if (existingEmailUser) {
            // Link Facebook account to existing user
            const { data: updatedUser } = await supabase
              .from('users')
              .update({
                oauth_provider: 'facebook',
                oauth_id: profile.id,
                email_verified: true, // Email is verified by Facebook
              })
              .eq('id', existingEmailUser.id)
              .select()
              .single();

            return done(null, updatedUser || existingEmailUser);
          }

          // Create new user
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              name: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'User',
              email: profile.emails?.[0]?.value!,
              password_hash: '', // No password for OAuth users
              plan_id: 1, // Free plan
              oauth_provider: 'facebook',
              oauth_id: profile.id,
              email_verified: true,
              avatar_url: profile.photos?.[0]?.value,
            })
            .select()
            .single();

          if (error) {
            throw error;
          }

          return done(null, newUser);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Serialize and deserialize user for session support (optional)
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
