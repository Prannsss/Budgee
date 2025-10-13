import { Request, Response } from 'express';
import { Transaction, Account, Category, ActivityLog } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';
import { Op } from 'sequelize';

/**
 * Get all transactions for authenticated user
 * GET /api/transactions
 */
export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20, type, startDate, endDate, account_id, category_id } = req.query;

  // Build where clause
  const where: any = { user_id: userId };
  
  if (type) where.type = type;
  if (account_id) where.account_id = account_id;
  if (category_id) where.category_id = category_id;
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = new Date(startDate as string);
    if (endDate) where.date[Op.lte] = new Date(endDate as string);
  }

  // Pagination
  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows: transactions } = await Transaction.findAndCountAll({
    where,
    include: [
      { model: Account, as: 'account', attributes: ['id', 'name', 'type', 'logo_url'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'type', 'icon', 'color'] },
    ],
    order: [['date', 'DESC'], ['created_at', 'DESC']],
    limit: Number(limit),
    offset,
  });

  res.json({
    success: true,
    data: {
      transactions,
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
 * Get single transaction
 * GET /api/transactions/:id
 */
export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    where: { id, user_id: userId },
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' },
    ],
  });

  if (!transaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { transaction },
  });
});

/**
 * Create new transaction
 * POST /api/transactions
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { account_id, category_id, type, amount, date, note, receipt_url, is_recurring, recurring_frequency } = req.body;

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

  // Verify category belongs to user
  const category = await Category.findOne({
    where: { id: category_id, user_id: userId },
  });

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  // Create transaction
  const transaction = await Transaction.create({
    user_id: userId,
    account_id,
    category_id,
    type,
    amount,
    date,
    note,
    receipt_url,
    is_recurring,
    recurring_frequency,
  });

  // Update account balance
  const newBalance = type === 'income' 
    ? Number(account.balance) + Number(amount)
    : Number(account.balance) - Number(amount);
  
  await account.update({ balance: newBalance });

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'transaction_created',
    description: `Created ${type} transaction: ${amount}`,
  });

  // Fetch full transaction with relations
  const fullTransaction = await Transaction.findByPk(transaction.id, {
    include: [
      { model: Account, as: 'account' },
      { model: Category, as: 'category' },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction: fullTransaction },
  });
});

/**
 * Update transaction
 * PUT /api/transactions/:id
 */
export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const { amount, date, note, receipt_url } = req.body;

  const transaction = await Transaction.findOne({
    where: { id, user_id: userId },
    include: [{ model: Account, as: 'account' }],
  });

  if (!transaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  const oldAmount = Number(transaction.amount);
  const account = transaction.account!;

  // Update transaction
  const updateData: any = {};
  if (amount !== undefined) updateData.amount = amount;
  if (date) updateData.date = date;
  if (note) updateData.note = note;
  if (receipt_url) updateData.receipt_url = receipt_url;

  await transaction.update(updateData);

  // Adjust account balance if amount changed
  if (amount !== undefined && amount !== oldAmount) {
    const amountDiff = Number(amount) - oldAmount;
    const newBalance = transaction.type === 'income'
      ? Number(account.balance) + amountDiff
      : Number(account.balance) - amountDiff;
    
    await account.update({ balance: newBalance });
  }

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'transaction_updated',
    description: `Updated transaction: ${transaction.id}`,
  });

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: { transaction },
  });
});

/**
 * Delete transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    where: { id, user_id: userId },
    include: [{ model: Account, as: 'account' }],
  });

  if (!transaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  const account = transaction.account!;
  
  // Reverse the transaction from account balance
  const newBalance = transaction.type === 'income'
    ? Number(account.balance) - Number(transaction.amount)
    : Number(account.balance) + Number(transaction.amount);
  
  await account.update({ balance: newBalance });

  // Delete transaction
  await transaction.destroy();

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'transaction_deleted',
    description: `Deleted transaction: ${id}`,
  });

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});
