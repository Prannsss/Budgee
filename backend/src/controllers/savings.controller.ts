import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { SavingsAllocationInsert, ActivityLogInsert } from '../types/database.types';

/**
 * Get all savings allocations for authenticated user
 * GET /api/savings/allocations
 */
export const getAllAllocations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { page = 1, limit = 20, type, startDate, endDate } = req.query;

  // Build query
  let query = supabase
    .from('savings_allocations')
    .select(`
      *,
      account:accounts(id, name, type)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  if (startDate) {
    query = query.gte('date', new Date(startDate as string).toISOString());
  }

  if (endDate) {
    query = query.lte('date', new Date(endDate as string).toISOString());
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(limit);
  query = query.range(offset, offset + Number(limit) - 1);

  const { data: allocations, count, error } = await query;

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch savings allocations',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      allocations: allocations || [],
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    },
  });
});

/**
 * Get single savings allocation
 * GET /api/savings/allocations/:id
 */
export const getAllocationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;

  const { data: allocation, error } = await supabase
    .from('savings_allocations')
    .select(`
      *,
      account:accounts(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !allocation) {
    res.status(404).json({
      success: false,
      message: 'Savings allocation not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { allocation },
  });
});

/**
 * Create new savings allocation
 * POST /api/savings/allocations
 */
export const createAllocation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { account_id, amount, type, description, date } = req.body;

  // Verify account belongs to user
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', account_id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (accountError || !account) {
    res.status(404).json({
      success: false,
      message: 'Account not found',
    });
    return;
  }

  // Validate amount
  if (!amount || amount <= 0) {
    res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0',
    });
    return;
  }

  // For deposits, check if account has sufficient balance
  if (type === 'deposit') {
    const accountBalance = Number(account.balance);
    if (accountBalance < amount) {
      res.status(400).json({
        success: false,
        message: `Insufficient balance. Account balance is ${accountBalance}`,
      });
      return;
    }
  }

  // For withdrawals, check if there are sufficient savings
  if (type === 'withdrawal') {
    // Calculate current total savings
    const { data: allAllocations } = await supabase
      .from('savings_allocations')
      .select('type, amount')
      .eq('user_id', userId);

    const currentSavings = (allAllocations || []).reduce((total, alloc) => {
      return alloc.type === 'deposit'
        ? total + Number(alloc.amount)
        : total - Number(alloc.amount);
    }, 0);

    if (currentSavings < amount) {
      res.status(400).json({
        success: false,
        message: `Insufficient savings. Current savings is ${currentSavings}`,
      });
      return;
    }
  }

  // Create savings allocation
  const { data: allocation, error: createError } = await supabase
    .from('savings_allocations')
    .insert({
      user_id: userId,
      account_id,
      amount,
      type,
      description,
      date: date || new Date().toISOString(),
    } as SavingsAllocationInsert)
    .select()
    .single();

  if (createError || !allocation) {
    res.status(500).json({
      success: false,
      message: 'Failed to create savings allocation',
    });
    return;
  }

  // Update account balance
  const newBalance =
    type === 'deposit'
      ? Number(account.balance) - Number(amount) // Deduct from account when depositing to savings
      : Number(account.balance) + Number(amount); // Add to account when withdrawing from savings

  await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', account_id);

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'savings_allocation_created',
    description: `${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${amount} ${type === 'deposit' ? 'to' : 'from'} savings`,
  } as ActivityLogInsert);

  // Fetch full allocation with relations
  const { data: fullAllocation } = await supabase
    .from('savings_allocations')
    .select(`
      *,
      account:accounts(*)
    `)
    .eq('id', allocation.id)
    .single();

  res.status(201).json({
    success: true,
    message: 'Savings allocation created successfully',
    data: { allocation: fullAllocation },
  });
});

/**
 * Delete savings allocation
 * DELETE /api/savings/allocations/:id
 */
export const deleteAllocation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;

  const { data: allocation, error: fetchError } = await supabase
    .from('savings_allocations')
    .select(`
      *,
      account:accounts(*)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError || !allocation) {
    res.status(404).json({
      success: false,
      message: 'Savings allocation not found',
    });
    return;
  }

  const account = allocation.account as any;

  // Reverse the account balance change
  const newBalance =
    allocation.type === 'deposit'
      ? Number(account.balance) + Number(allocation.amount) // Add back to account
      : Number(account.balance) - Number(allocation.amount); // Deduct from account

  await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', account.id);

  // Delete allocation
  const { error: deleteError } = await supabase
    .from('savings_allocations')
    .delete()
    .eq('id', id);

  if (deleteError) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete savings allocation',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'savings_allocation_deleted',
    description: `Deleted savings ${allocation.type}: ${allocation.amount}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Savings allocation deleted successfully',
  });
});

/**
 * Get total savings for user
 * GET /api/savings/total
 */
export const getTotalSavings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;

  const { data: allocations } = await supabase
    .from('savings_allocations')
    .select('type, amount')
    .eq('user_id', userId);

  const totalSavings = (allocations || []).reduce((total, alloc) => {
    return alloc.type === 'deposit'
      ? total + Number(alloc.amount)
      : total - Number(alloc.amount);
  }, 0);

  res.json({
    success: true,
    data: { totalSavings },
  });
});
