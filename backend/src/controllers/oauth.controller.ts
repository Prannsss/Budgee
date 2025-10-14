import { Request, Response } from 'express';
import { generateToken, generateRefreshToken } from '../middlewares/auth.middleware';
import { ActivityLog } from '../models';

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      // Redirect to login with error
      return res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Log activity
    await ActivityLog.create({
      user_id: user.id,
      action: 'oauth_login',
      description: `User logged in via Google`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      plan_id: user.plan_id,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.CORS_ORIGIN}/login?token=${token}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
  }
};

/**
 * Facebook OAuth callback
 * GET /api/auth/facebook/callback
 */
export const facebookCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    if (!user) {
      // Redirect to login with error
      return res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Log activity
    await ActivityLog.create({
      user_id: user.id,
      action: 'oauth_login',
      description: `User logged in via Facebook`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    });

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      plan_id: user.plan_id,
    });
    const refreshToken = generateRefreshToken(user.id);

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.CORS_ORIGIN}/login?token=${token}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect(`${process.env.CORS_ORIGIN}/login?error=oauth_failed`);
  }
};
