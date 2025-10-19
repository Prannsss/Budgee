import { Request, Response } from 'express';
import { SpendingLimit, Transaction } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';
import { SpendingLimitService } from '../utils/spending-limit.service';

/**
 * Get all spending limits for authenticated user
 * GET /api/spending-limits
 */
export const getSpendingLimits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  // Check and reset any limits that need resetting
  await SpendingLimitService.checkAndResetAllUserLimits(userId!);

  const limits = await SpendingLimit.findAll({
    where: { user_id: userId },
    order: [
      [sequelize.literal("CASE WHEN type = 'Daily' THEN 1 WHEN type = 'Weekly' THEN 2 WHEN type = 'Monthly' THEN 3 END"), 'ASC']
    ],
  });

  // If no limits exist, create default ones
  if (limits.length === 0) {
    const defaultLimits = await SpendingLimitService.initializeDefaultLimits(userId!);

    return res.json({
      success: true,
      data: defaultLimits,
    });
  }

  return res.json({
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
  const userId = req.user?.id;

  // First, check and reset any limits that need resetting
  await SpendingLimitService.checkAndResetAllUserLimits(userId!);

  const limits = await SpendingLimit.findAll({
    where: { user_id: userId },
  });

  const status = limits.map(limit => {
    const percentage = limit.getPercentageUsed();
    const isExceeded = limit.isExceeded();
    const isNearLimit = limit.isNearLimit();

    return {
      type: limit.type,
      amount: parseFloat(limit.amount.toString()),
      current_spending: parseFloat(limit.current_spending.toString()),
      remaining: parseFloat(limit.getRemainingAmount().toString()),
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
  const userId = req.user?.id;
  const { type } = req.params;
  const { amount } = req.body;

  // Validate type
  if (!['Daily', 'Weekly', 'Monthly'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit type. Must be Daily, Weekly, or Monthly.',
    });
  }

  // Validate amount
  if (amount === undefined || amount < 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a non-negative number.',
    });
  }

  // Find or create the limit
  let [limit, created] = await SpendingLimit.findOrCreate({
    where: { 
      user_id: userId!,
      type: type as 'Daily' | 'Weekly' | 'Monthly',
    },
    defaults: {
      user_id: userId!,
      type: type as 'Daily' | 'Weekly' | 'Monthly',
      amount,
      current_spending: 0,
    },
  });

  if (!created) {
    // Update existing limit
    limit.amount = amount;
    await limit.save();
  }

  return res.json({
    success: true,
    message: `${type} spending limit ${created ? 'created' : 'updated'} successfully.`,
    data: limit,
  });
});

/**
 * Reset spending limits manually (for testing or admin purposes)
 * POST /api/spending-limits/reset
 */
export const resetSpendingLimits = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { type } = req.body; // Optional: reset specific type or all

  const where: any = { user_id: userId };
  if (type && ['Daily', 'Weekly', 'Monthly'].includes(type)) {
    where.type = type;
  }

  await SpendingLimit.update(
    {
      current_spending: 0,
      last_reset: new Date(),
    },
    { where }
  );

  res.json({
    success: true,
    message: type ? `${type} spending limit reset successfully.` : 'All spending limits reset successfully.',
  });
});

/**
 * Check if a transaction would exceed spending limits
 * POST /api/spending-limits/check
 */
export const checkSpendingLimit = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { amount, type } = req.body;

  // Only check for expense transactions
  if (type !== 'expense') {
    return res.json({
      success: true,
      can_proceed: true,
      message: 'Transaction type does not affect spending limits.',
    });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid transaction amount.',
    });
  }

  const limits = await SpendingLimit.findAll({
    where: { user_id: userId },
  });

  const violations: any[] = [];

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

  return res.json({
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
  const userId = req.user?.id;
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

  const expenses = await Transaction.findAll({
    where: {
      user_id: userId,
      type: 'expense',
      status: 'completed',
      date: {
        [Op.gte]: dateRange,
      },
    },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('date')), 'date'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
    ],
    group: [sequelize.fn('DATE', sequelize.col('date'))],
    order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']],
    raw: true,
  });

  res.json({
    success: true,
    data: {
      period,
      trends: expenses,
    },
  });
});
