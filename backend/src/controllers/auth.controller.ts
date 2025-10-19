import { Request, Response } from 'express';
import { User as UserModel, Plan, ActivityLog, OTP } from '../models';
import { hashPassword, comparePassword, sanitizeUser, generateOTP, getOTPExpiration } from '../utils/helpers';
import { generateToken, generateRefreshToken } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email.service';
import { createDefaultCashAccount } from '../utils/account.service';
import { initializeDefaultCategories } from './category.controller';
import sequelize from '../config/sequelize';

/**
 * User signup/registration
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findOne({ where: { email } });
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
  const user = await UserModel.create({
    name,
    email,
    phone,
    password_hash,
    plan_id: 1, // Free plan by default
    email_verified: false,
  });

  // Generate verification OTP (6-digit code)
  const verification_code = generateOTP();
  const otp_expires = getOTPExpiration(10); // 10 minutes

  // Store OTP in otps table
  await OTP.create({
    user_id: user.id,
    code: verification_code,
    purpose: 'email_verify',
    expires_at: otp_expires,
  });

  // Default accounts will be created after email verification

  // Send verification email
  try {
    await sendVerificationEmail(email, name, verification_code);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Continue even if email fails
  }

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'user_signup',
    description: 'User account created - awaiting email verification',
    ip_address: req.ip,
    user_agent: req.get('user-agent'),
  });

  // Return user data without password and tokens
  // User must verify email before logging in
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
 * User login
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await UserModel.findOne({
    where: { email, is_active: true },
    include: [{ model: Plan, as: 'plan' }],
  });

  if (!user) {
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
  await user.update({ last_login: new Date() });

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'user_login',
    description: 'User logged in',
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

  // Return user data
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

  const user = await UserModel.findByPk(userId, {
    include: [{ model: Plan, as: 'plan' }],
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  const userData = sanitizeUser(user);

  res.json({
    success: true,
    data: { user: userData },
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, firstName, lastName, phone, avatar_url } = req.body;

  const user = await UserModel.findByPk(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Update allowed fields
  const updateData: any = {};
  
  // Handle name field - can come as 'name' or 'firstName' + 'lastName'
  if (name) {
    updateData.name = name;
  } else if (firstName || lastName) {
    // Combine firstName and lastName if provided separately
    const combinedName = `${firstName || ''} ${lastName || ''}`.trim();
    if (combinedName) updateData.name = combinedName;
  }
  
  if (phone) updateData.phone = phone;
  if (avatar_url) updateData.avatar_url = avatar_url;

  await user.update(updateData);

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'profile_updated',
    description: 'User profile updated',
  });

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

  const user = await UserModel.findByPk(userId);

  if (!user) {
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
  await user.update({ password_hash });

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'password_changed',
    description: 'User password changed',
  });

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
    await ActivityLog.create({
      user_id: userId,
      action: 'user_logout',
      description: 'User logged out',
    });
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
  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
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
  const otp = await OTP.findOne({
    where: {
      user_id: user.id,
      code: code,
      purpose: 'email_verify',
      is_verified: false,
    },
    order: [['created_at', 'DESC']],
  });

  if (!otp) {
    res.status(400).json({
      success: false,
      message: 'Invalid verification code',
    });
    return;
  }

  // Check if OTP is expired
  const now = new Date();
  if (now.getTime() > otp.expires_at.getTime()) {
    res.status(400).json({
      success: false,
      message: 'Verification code has expired. Please request a new one.',
      expired: true,
    });
    return;
  }

  // Mark OTP as verified
  await otp.update({ is_verified: true });

  // Verify email
  await user.update({
    email_verified: true,
  });

  // Create default Cash account for the newly verified user
  try {
    await createDefaultCashAccount(user.id);
  } catch (error) {
    console.error('Failed to create default Cash account:', error);
    // Continue even if account creation fails
  }

  // Initialize default categories for the newly verified user
  try {
    await initializeDefaultCategories(user.id);
  } catch (error) {
    console.error('Failed to initialize default categories:', error);
    // Continue even if category initialization fails
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(email, user.name);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'email_verified',
    description: 'User email verified successfully',
  });

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
  const user = await UserModel.findOne({ where: { email } });

  if (!user) {
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
  const lastOTP = await OTP.findOne({
    where: {
      user_id: user.id,
      purpose: 'email_verify',
    },
    order: [['created_at', 'DESC']],
  });

  if (lastOTP) {
    const timeSinceLastSent = Date.now() - lastOTP.created_at.getTime();
    const cooldownPeriod = 30 * 1000; // 30 seconds in milliseconds
    
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
  await OTP.create({
    user_id: user.id,
    code: verification_code,
    purpose: 'email_verify',
    expires_at: otp_expires,
  });

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
  const user = await UserModel.findByPk(userId);
  
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Use a transaction to ensure all deletions succeed or rollback
  const transaction = await sequelize.transaction();

  try {
    // Log the account deletion before deleting
    await ActivityLog.create({
      user_id: userId,
      action: 'account_deleted',
      description: `User ${user.name} (${user.email}) deleted their account`,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
    }, { transaction });

    // Delete user - CASCADE will automatically delete all related data:
    // - accounts (via ON DELETE CASCADE)
    // - transactions (via account CASCADE)
    // - categories (via ON DELETE CASCADE)
    // - spending_limits (via ON DELETE CASCADE)
    // - activity_logs (via ON DELETE CASCADE)
    // - otps (via ON DELETE CASCADE)
    // - user_pins (via ON DELETE CASCADE)
    // - savings_allocations (via ON DELETE CASCADE)
    // - refresh_tokens (via ON DELETE CASCADE)
    await user.destroy({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account. Please try again later.',
    });
  }
});

