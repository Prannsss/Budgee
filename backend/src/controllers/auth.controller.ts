import { Request, Response } from 'express';
import { User, Plan, ActivityLog } from '../models';
import { hashPassword, comparePassword, sanitizeUser } from '../utils/helpers';
import { generateToken, generateRefreshToken } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * User signup/registration
 * POST /api/auth/signup
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
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
  const user = await User.create({
    name,
    email,
    phone,
    password_hash,
    plan_id: 1, // Free plan by default
  });

  // Log activity
  await ActivityLog.create({
    user_id: user.id,
    action: 'user_signup',
    description: 'User account created',
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

  // Return user data without password
  const userData = sanitizeUser(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userData,
      token,
      refreshToken,
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
  const user = await User.findOne({
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

  const user = await User.findByPk(userId, {
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
  const { name, phone, avatar_url } = req.body;

  const user = await User.findByPk(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Update allowed fields
  const updateData: any = {};
  if (name) updateData.name = name;
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

  const user = await User.findByPk(userId);

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
