import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { SpendingLimitService } from '../utils/spending-limit.service';

/**
 * Get all spending limits for authenticated user
 * GET /api/spending-limits
 */
export const getSpendingLimits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;

  // Check and reset any limits that need resetting
  await SpendingLimitService.checkAndResetAllUserLimits(userId);

  const { data: limits, error } = await supabase
    .from('spending_limits')
    .select('*')
    .eq('user_id', userId)
    .order('type', { ascending: true }); // Daily, Monthly, Weekly alphabetically

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spending limits',
    });
    return;
  }

  // If no limits exist, create default ones
  if (!limits || limits.length === 0) {
    const defaultLimits = await SpendingLimitService.initializeDefaultLimits(userId);

    res.json({
      success: true,
      data: defaultLimits,
    });
    return;
  }

  res.json({
    success: true,
    data: limits,
  });
});

/**
 * Get spending limit status for authenticated user
 * Returns detailed status including warnings and exceeded limits
 * GET /api/spending-limits/status
 */
export const getSpendingLimitStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;

  // First, check and reset any limits that need resetting
  await SpendingLimitService.checkAndResetAllUserLimits(userId);

  const { data: limits } = await supabase
    .from('spending_limits')
    .select('*')
    .eq('user_id', userId);

  if (!limits || limits.length === 0) {
    res.json({
      success: true,
      data: {
        limits: [],
        has_exceeded: false,
        has_warning: false,
        overall_status: 'normal',
      },
    });
    return;
  }

  const status = limits.map(limit => {
    const percentage = SpendingLimitService.getPercentageUsed(limit);
    const isExceeded = SpendingLimitService.isExceeded(limit);
    const isNearLimit = SpendingLimitService.isNearLimit(limit);

    return {
      type: limit.type,
      amount: parseFloat(limit.amount.toString()),
      current_spending: parseFloat(limit.current_spending.toString()),
      remaining: parseFloat(SpendingLimitService.getRemainingAmount(limit).toString()),
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      is_exceeded: isExceeded,
      is_near_limit: isNearLimit && !isExceeded,
      last_reset: limit.last_reset,
      status: isExceeded ? 'exceeded' : isNearLimit ? 'warning' : 'normal',
    };
  });

  // Check if any limits are exceeded or near limit
  const hasExceeded = status.some(s => s.is_exceeded);
  const hasWarning = status.some(s => s.is_near_limit);

  res.json({
    success: true,
    data: {
      limits: status,
      has_exceeded: hasExceeded,
      has_warning: hasWarning,
      overall_status: hasExceeded ? 'exceeded' : hasWarning ? 'warning' : 'normal',
    },
  });
});

/**
 * Update a specific spending limit
 * PUT /api/spending-limits/:type
 */
export const updateSpendingLimit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { type } = req.params;
  const { amount } = req.body;

  // Validate type
  if (!['Daily', 'Weekly', 'Monthly'].includes(type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid limit type. Must be Daily, Weekly, or Monthly.',
    });
    return;
  }

  // Validate amount
  if (amount === undefined || amount < 0) {
    res.status(400).json({
      success: false,
      message: 'Amount must be a non-negative number.',
    });
    return;
  }

  // Check if limit exists
  const { data: existingLimit } = await supabase
    .from('spending_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .single();

  if (existingLimit) {
    // Update existing limit
    const { data: limit, error } = await supabase
      .from('spending_limits')
      .update({ amount })
      .eq('id', existingLimit.id)
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update spending limit',
      });
      return;
    }

    res.json({
      success: true,
      message: `${type} spending limit updated successfully.`,
      data: limit,
    });
  } else {
    // Create new limit
    const { data: limit, error } = await supabase
      .from('spending_limits')
      .insert({
        user_id: userId,
        type: type as 'Daily' | 'Weekly' | 'Monthly',
        amount,
        current_spending: 0,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create spending limit',
      });
      return;
    }

    res.json({
      success: true,
      message: `${type} spending limit created successfully.`,
      data: limit,
    });
  }
});

/**
 * Reset spending limits manually (for testing or admin purposes)
 * POST /api/spending-limits/reset
 */
export const resetSpendingLimits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { type } = req.body; // Optional: reset specific type or all

  if (type && !['Daily', 'Weekly', 'Monthly'].includes(type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid limit type. Must be Daily, Weekly, or Monthly.',
    });
    return;
  }

  let query = supabase
    .from('spending_limits')
    .update({
      current_spending: 0,
      last_reset: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (type) {
    query = query.eq('type', type);
  }

  const { error } = await query;

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset spending limits',
    });
    return;
  }

  res.json({
    success: true,
    message: type
      ? `${type} spending limit reset successfully.`
      : 'All spending limits reset successfully.',
  });
});

/**
 * Check if a transaction would exceed spending limits
 * POST /api/spending-limits/check
 */
export const checkSpendingLimit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { amount, type } = req.body;

  // Only check for expense transactions
  if (type !== 'expense') {
    res.json({
      success: true,
      can_proceed: true,
      message: 'Transaction type does not affect spending limits.',
    });
    return;
  }

  if (!amount || amount <= 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid transaction amount.',
    });
    return;
  }

  const { data: limits } = await supabase
    .from('spending_limits')
    .select('*')
    .eq('user_id', userId);

  if (!limits || limits.length === 0) {
    res.json({
      success: true,
      can_proceed: true,
      message: 'No spending limits configured.',
    });
    return;
  }

  const violations: Array<{
    type: string;
    limit: number;
    current: number;
    after_transaction: number;
    exceeded_by: number;
  }> = [];

  for (const limit of limits) {
    const newSpending = parseFloat(limit.current_spending.toString()) + parseFloat(amount);
    const limitAmount = parseFloat(limit.amount.toString());

    if (limitAmount > 0 && newSpending > limitAmount) {
      violations.push({
        type: limit.type,
        limit: limitAmount,
        current: parseFloat(limit.current_spending.toString()),
        after_transaction: newSpending,
        exceeded_by: newSpending - limitAmount,
      });
    }
  }

  const canProceed = violations.length === 0;

  res.json({
    success: true,
    can_proceed: canProceed,
    violations,
    message: canProceed
      ? 'Transaction within all spending limits.'
      : `Transaction would exceed ${violations.length} spending limit(s).`,
  });
});

/**
 * Get spending history/trends
 * GET /api/spending-limits/trends
 */
export const getSpendingTrends = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { period = 'monthly' } = req.query; // daily, weekly, monthly

  let dateRange: Date;
  const now = new Date();

  switch (period) {
    case 'daily':
      dateRange = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
    default:
      dateRange = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Get all expense transactions in period
  const { data: transactions } = await supabase
    .from('transactions')
    .select('date, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .eq('status', 'completed')
    .gte('date', dateRange.toISOString())
    .order('date', { ascending: true });

  // Group by date
  const trendsMap = new Map<string, number>();

  (transactions || []).forEach(tx => {
    const date = tx.date.split('T')[0]; // Get just the date part (YYYY-MM-DD)

    if (!trendsMap.has(date)) {
      trendsMap.set(date, 0);
    }

    trendsMap.set(date, trendsMap.get(date)! + Number(tx.amount));
  });

  // Convert to array format
  const trends = Array.from(trendsMap.entries()).map(([date, total]) => ({
    date,
    total,
  }));

  res.json({
    success: true,
    data: {
      period,
      trends,
    },
  });
});
