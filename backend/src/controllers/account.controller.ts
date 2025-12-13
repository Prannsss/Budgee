import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { AccountInsert, ActivityLogInsert } from '../types/database.types';

/**
 * Get all accounts for authenticated user
 * GET /api/accounts
 */
export const getAllAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accounts',
    });
    return;
  }

  res.json({
    success: true,
    data: accounts || [], // Return array directly, not wrapped in object
  });
});

/**
 * Get single account
 * GET /api/accounts/:id
 */
export const getAccountById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error || !account) {
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
  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('id', userId)
    .single();

  if (userError || !user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Check plan limits - use total account count (excluding Cash accounts)
  const { count: totalAccountCount } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)
    .neq('type', 'Cash'); // Don't count Cash accounts

  const plan = (user as any).plan;
  
  if (!plan) {
    res.status(500).json({
      success: false,
      message: 'User plan not found',
    });
    return;
  }

  // Use max_accounts as the total limit for all account types
  const totalLimit = plan.max_accounts;
  const currentCount = totalAccountCount || 0;

  // Check if adding this new account would exceed the limit
  if (currentCount >= totalLimit) {
    res.status(403).json({
      success: false,
      message: `You have reached the account limit (${totalLimit}) for your plan. Please upgrade to add more.`,
    });
    return;
  }

  // Create account
  const { data: account, error: createError } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name,
      type,
      account_number,
      logo_url,
      balance: balance || 0,
      is_manual: true, // Default to manual unless API-connected
      is_active: true,
      verified: false,
    } as AccountInsert)
    .select()
    .single();

  if (createError || !account) {
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'account_created',
    description: `Created ${type}: ${name}`,
  } as ActivityLogInsert);

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

  // Verify account exists and belongs to user
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (!existingAccount) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Build update data
  interface AccountUpdate {
    name?: string;
    balance?: number;
    logo_url?: string;
  }
  
  const updateData: AccountUpdate = {};
  if (name) updateData.name = name;
  if (balance !== undefined) updateData.balance = balance;
  if (logo_url) updateData.logo_url = logo_url;

  // Update account
  const { data: account, error } = await supabase
    .from('accounts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !account) {
    res.status(500).json({
      success: false,
      message: 'Failed to update account',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId!,
    action: 'account_updated',
    description: `Updated account: ${account.name}`,
  } as ActivityLogInsert);

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

  // Get account
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existingAccount) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Mark as verified
  const { data: account, error } = await supabase
    .from('accounts')
    .update({ verified: true })
    .eq('id', id)
    .select()
    .single();

  if (error || !account) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify account',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId!,
    action: 'account_verified',
    description: `Verified account: ${account.name}`,
  } as ActivityLogInsert);

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

  // Get account
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (!existingAccount) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Soft delete
  const { error } = await supabase
    .from('accounts')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId!,
    action: 'account_deleted',
    description: `Deleted account: ${existingAccount.name}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});
