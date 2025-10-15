import { Request, Response } from 'express';
import { SavingsAllocation, Account, ActivityLog } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';
import { Op } from 'sequelize';

/**
 * Get all savings allocations for authenticated user
 * GET /api/savings/allocations
 */
export const getAllAllocations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20, type, startDate, endDate } = req.query;

  // Build where clause
  const where: any = { user_id: userId };
  
  if (type) where.type = type;
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = new Date(startDate as string);
    if (endDate) where.date[Op.lte] = new Date(endDate as string);
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows: allocations } = await SavingsAllocation.findAndCountAll({
    where,
    include: [
      { model: Account, as: 'account', attributes: ['id', 'name', 'type'] },
    ],
    order: [['date', 'DESC'], ['created_at', 'DESC']],
    limit: Number(limit),
    offset,
  });

  res.json({
    success: true,
    data: {
      allocations,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    },
  });
});

/**
 * Get single savings allocation
 * GET /api/savings/allocations/:id
 */
export const getAllocationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const allocation = await SavingsAllocation.findOne({
    where: { id, user_id: userId },
    include: [{ model: Account, as: 'account' }],
  });

  if (!allocation) {
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
  const account = await Account.findOne({
    where: { id: account_id, user_id: userId, is_active: true },
  });

  if (!account) {
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
    const allAllocations = await SavingsAllocation.findAll({
      where: { user_id: userId },
      attributes: ['type', 'amount'],
    });
    
    const currentSavings = allAllocations.reduce((total, alloc) => {
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
  const allocation = await SavingsAllocation.create({
    user_id: userId,
    account_id,
    amount,
    type,
    description,
    date: date || new Date(),
  });

  // Update account balance
  const newBalance = type === 'deposit'
    ? Number(account.balance) - Number(amount) // Deduct from account when depositing to savings
    : Number(account.balance) + Number(amount); // Add to account when withdrawing from savings
  
  await account.update({ balance: newBalance });

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'savings_allocation_created',
    description: `${type === 'deposit' ? 'Deposited' : 'Withdrew'} ${amount} ${type === 'deposit' ? 'to' : 'from'} savings`,
  });

  // Fetch full allocation with relations
  const fullAllocation = await SavingsAllocation.findByPk(allocation.id, {
    include: [{ model: Account, as: 'account' }],
  });

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

  const allocation = await SavingsAllocation.findOne({
    where: { id, user_id: userId },
    include: [{ model: Account, as: 'account' }],
  });

  if (!allocation) {
    res.status(404).json({
      success: false,
      message: 'Savings allocation not found',
    });
    return;
  }

  const account = allocation.account!;

  // Reverse the account balance change
  const newBalance = allocation.type === 'deposit'
    ? Number(account.balance) + Number(allocation.amount) // Add back to account
    : Number(account.balance) - Number(allocation.amount); // Deduct from account
  
  await account.update({ balance: newBalance });

  // Delete allocation
  await allocation.destroy();

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'savings_allocation_deleted',
    description: `Deleted savings ${allocation.type}: ${allocation.amount}`,
  });

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
  const userId = req.user?.id;

  const allocations = await SavingsAllocation.findAll({
    where: { user_id: userId },
    attributes: ['type', 'amount'],
  });

  const totalSavings = allocations.reduce((total, alloc) => {
    return alloc.type === 'deposit' 
      ? total + Number(alloc.amount)
      : total - Number(alloc.amount);
  }, 0);

  res.json({
    success: true,
    data: { totalSavings },
  });
});
