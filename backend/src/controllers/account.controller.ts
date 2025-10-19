import { Request, Response } from 'express';
import { Account, User, Plan, ActivityLog } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Get all accounts for authenticated user
 * GET /api/accounts
 */
export const getAllAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const accounts = await Account.findAll({
    where: { user_id: userId, is_active: true },
    order: [['created_at', 'DESC']],
  });

  res.json({
    success: true,
    data: accounts, // Return array directly, not wrapped in object
  });
});

/**
 * Get single account
 * GET /api/accounts/:id
 */
export const getAccountById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const account = await Account.findOne({
    where: { id, user_id: userId, is_active: true },
  });

  if (!account) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { account },
  });
});

/**
 * Create/connect new account
 * POST /api/accounts
 */
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { name, type, account_number, logo_url, balance } = req.body;

  // Get user with plan details
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

  // Check plan limits
  const accountCount = await Account.count({
    where: { 
      user_id: userId, 
      is_active: true,
      type: type === 'e-wallet' ? 'e-wallet' : 'bank'
    },
  });

  const plan = user.plan;
  
  if (!plan) {
    res.status(500).json({
      success: false,
      message: 'User plan not found',
    });
    return;
  }

  const limit = type === 'e-wallet' ? plan.max_wallets : plan.max_accounts;

  if (accountCount >= limit) {
    res.status(403).json({
      success: false,
      message: `You have reached the ${type === 'e-wallet' ? 'e-wallet' : 'bank account'} limit for your plan. Please upgrade to add more.`,
    });
    return;
  }

  // Create account
  const account = await Account.create({
    user_id: userId,
    name,
    type,
    account_number,
    logo_url,
    balance: balance || 0,
    is_manual: true, // Default to manual unless API-connected
  });

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'account_created',
    description: `Created ${type}: ${name}`,
  });

  res.status(201).json({
    success: true,
    message: 'Account connected successfully',
    data: { account },
  });
});

/**
 * Update account
 * PUT /api/accounts/:id
 */
export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { name, balance, logo_url } = req.body;

  const account = await Account.findOne({
    where: { id, user_id: userId, is_active: true },
  });

  if (!account) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Update fields
  const updateData: any = {};
  if (name) updateData.name = name;
  if (balance !== undefined) updateData.balance = balance;
  if (logo_url) updateData.logo_url = logo_url;

  await account.update(updateData);

  // Log activity
  await ActivityLog.create({
    user_id: userId!,
    action: 'account_updated',
    description: `Updated account: ${account.name}`,
  });

  res.json({
    success: true,
    message: 'Account updated successfully',
    data: { account },
  });
});

/**
 * Verify account (using OTP)
 * POST /api/accounts/:id/verify
 */
export const verifyAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const account = await Account.findOne({
    where: { id, user_id: userId },
  });

  if (!account) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Mark as verified
  await account.update({ verified: true });

  // Log activity
  await ActivityLog.create({
    user_id: userId!,
    action: 'account_verified',
    description: `Verified account: ${account.name}`,
  });

  res.json({
    success: true,
    message: 'Account verified successfully',
    data: { account },
  });
});

/**
 * Delete account (soft delete)
 * DELETE /api/accounts/:id
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const account = await Account.findOne({
    where: { id, user_id: userId, is_active: true },
  });

  if (!account) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Soft delete
  await account.update({ is_active: false });

  // Log activity
  await ActivityLog.create({
    user_id: userId!,
    action: 'account_deleted',
    description: `Deleted account: ${account.name}`,
  });

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});
