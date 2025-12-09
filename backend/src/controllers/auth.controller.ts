import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { hashPassword, comparePassword, sanitizeUser, generateOTP, getOTPExpiration, hasAIBuddyAccess } from '../utils/helpers';
import { generateToken, generateRefreshToken } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.service';
import { createDefaultCashAccount } from '../utils/account.service';
import { initializeDefaultCategories } from './category.controller';
import { User, UserInsert, OTPInsert, ActivityLogInsert } from '../types/database.types';

/**
 * User signup/registration with Supabase
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single();

  if (existingUser) {
    res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
    return;
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create user with free plan (plan_id = 1)
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      name,
      email,
      phone,
      password_hash,
      plan_id: 1, // Free plan by default
      email_verified: false,
    } as UserInsert)
    .select()
    .single();

  if (userError || !user) {
    console.error('Error creating user:', userError);
    res.status(500).json({
      success: false,
      message: 'Failed to create user account',
    });
    return;
  }

  // Generate verification OTP (6-digit code)
  const verification_code = generateOTP();
  const otp_expires = getOTPExpiration(10); // 10 minutes

  // Store OTP in otps table
  const { error: otpError } = await supabase
    .from('otps')
    .insert({
      user_id: user.id,
      code: verification_code,
      purpose: 'email_verify',
      expires_at: otp_expires.toISOString(),
      is_verified: false,
      attempts: 0,
      max_attempts: 3,
    } as OTPInsert);

  if (otpError) {
    console.error('Error creating OTP:', otpError);
    // Continue even if OTP creation fails
  }

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verification_code);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Continue even if email fails
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'user_signup',
    description: 'User account created - awaiting email verification',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
  } as ActivityLogInsert);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      requiresVerification: true,
    },
  });
});

/**
 * User login with Supabase
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with plan
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (userError || !user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  // Check if email is verified
  if (!user.email_verified) {
    res.status(403).json({
      success: false,
      message: 'Please verify your email address before logging in. Check your inbox for a verification email.',
      requiresVerification: true,
      email: user.email,
    });
    return;
  }

  // Ensure user has a default Cash account (safety check for existing users)
  try {
    await createDefaultCashAccount(user.id);
  } catch (error) {
    console.error('Failed to ensure Cash account exists:', error);
    // Continue with login even if this fails
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'user_login',
    description: 'User logged in',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
  } as ActivityLogInsert);

  // Generate tokens
  const token = generateToken({
    id: user.id,
    email: user.email,
    plan_id: user.plan_id,
  });
  const refreshToken = generateRefreshToken(user.id);

  // Return user data (sanitizeUser helper should work with Supabase data)
  const userData = sanitizeUser(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userData,
      token,
      refreshToken,
    },
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  const userData = sanitizeUser(user);

  // Add AI buddy access status
  const aiAccess = hasAIBuddyAccess(user);

  res.json({
    success: true,
    data: { 
      user: userData,
      hasAIBuddyAccess: aiAccess
    },
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, firstName, lastName, phone, avatar_url } = req.body;

  // Build update data
  const updateData: Partial<User> = {};
  
  // Handle name field - can come as 'name' or 'firstName' + 'lastName'
  if (name) {
    updateData.name = name;
  } else if (firstName || lastName) {
    const combinedName = `${firstName || ''} ${lastName || ''}`.trim();
    if (combinedName) updateData.name = combinedName;
  }
  
  if (phone) updateData.phone = phone;
  if (avatar_url) updateData.avatar_url = avatar_url;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error || !user) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'profile_updated',
    description: 'User profile updated',
  } as ActivityLogInsert);

  const userData = sanitizeUser(user);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: userData },
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('id', userId)
    .single();

  if (error || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
    return;
  }

  // Hash and update new password
  const password_hash = await hashPassword(newPassword);
  await supabase
    .from('users')
    .update({ password_hash })
    .eq('id', user.id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'password_changed',
    description: 'User password changed',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Log activity
  if (userId) {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'user_logout',
      description: 'User logged out',
    } as ActivityLogInsert);
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Verify email with OTP
 * POST /api/auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400).json({
      success: false,
      message: 'Email and verification code are required',
    });
    return;
  }

  // Find user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Check if already verified
  if (user.email_verified) {
    res.status(400).json({
      success: false,
      message: 'Email is already verified',
    });
    return;
  }

  // Find valid OTP for this user
  const { data: otps, error: otpError } = await supabase
    .from('otps')
    .select('*')
    .eq('user_id', user.id)
    .eq('code', code)
    .eq('purpose', 'email_verify')
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  if (otpError || !otps || otps.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid verification code',
    });
    return;
  }

  const otp = otps[0];

  // Check if OTP is expired
  const now = new Date();
  const expiresAt = new Date(otp.expires_at);
  if (now.getTime() > expiresAt.getTime()) {
    res.status(400).json({
      success: false,
      message: 'Verification code has expired. Please request a new one.',
      expired: true,
    });
    return;
  }

  // Mark OTP as verified
  await supabase
    .from('otps')
    .update({ is_verified: true })
    .eq('id', otp.id);

  // Verify email
  await supabase
    .from('users')
    .update({ email_verified: true })
    .eq('id', user.id);

  // Create default Cash account for the newly verified user
  try {
    await createDefaultCashAccount(user.id);
  } catch (error) {
    console.error('Failed to create default Cash account:', error);
  }

  // Initialize default categories for the newly verified user
  try {
    await initializeDefaultCategories(user.id);
  } catch (error) {
    console.error('Failed to initialize default categories:', error);
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(email, user.name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'email_verified',
    description: 'User email verified successfully',
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
});

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      message: 'Email is required',
    });
    return;
  }

  // Find user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Check if already verified
  if (user.email_verified) {
    res.status(400).json({
      success: false,
      message: 'Email is already verified',
    });
    return;
  }

  // Check if user is trying to resend too quickly (30 seconds cooldown)
  const { data: lastOTPs } = await supabase
    .from('otps')
    .select('*')
    .eq('user_id', user.id)
    .eq('purpose', 'email_verify')
    .order('created_at', { ascending: false })
    .limit(1);

  if (lastOTPs && lastOTPs.length > 0) {
    const lastOTP = lastOTPs[0];
    const timeSinceLastSent = Date.now() - new Date(lastOTP.created_at).getTime();
    const cooldownPeriod = 30 * 1000; // 30 seconds
    
    if (timeSinceLastSent < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSent) / 1000);
      res.status(429).json({
        success: false,
        message: `Please wait ${remainingTime} seconds before requesting a new code.`,
        remainingTime,
      });
      return;
    }
  }

  // Generate new verification code
  const verification_code = generateOTP();
  const otp_expires = getOTPExpiration(10); // 10 minutes

  // Create new OTP
  await supabase.from('otps').insert({
    user_id: user.id,
    code: verification_code,
    purpose: 'email_verify',
    expires_at: otp_expires.toISOString(),
    is_verified: false,
    attempts: 0,
    max_attempts: 3,
  } as OTPInsert);

  // Send verification email
  try {
    await sendVerificationEmail(email, user.name, verification_code);
    
    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email. Please try again later.',
    });
  }
});

/**
 * Delete user account and all associated data
 * DELETE /api/auth/account
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Verify user exists
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', userId)
    .single();
  
  if (userError || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  try {
    // Log the account deletion before deleting
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: 'account_deleted',
      description: `User ${user.name} (${user.email}) deleted their account`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    } as ActivityLogInsert);

    // Delete user - CASCADE in database will automatically delete all related data:
    // - accounts (via ON DELETE CASCADE)
    // - transactions (via account CASCADE)
    // - categories (via ON DELETE CASCADE)
    // - spending_limits (via ON DELETE CASCADE)
    // - activity_logs (via ON DELETE CASCADE)
    // - otps (via ON DELETE CASCADE)
    // - user_pins (via ON DELETE CASCADE)
    // - savings_allocations (via ON DELETE CASCADE)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account. Please try again later.',
    });
  }
});

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh-token
 */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
    return;
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, secret) as { id: number };

    // Fetch user to ensure they still exist and are active
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    // Generate new tokens
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      plan_id: user.plan_id,
    });
    const newRefreshToken = generateRefreshToken(user.id);

    // Return new tokens and user data
    const userData = sanitizeUser(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: userData,
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
    });
  }
});
