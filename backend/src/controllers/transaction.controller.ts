/**
 * Transaction Controller with Supabase
 * Complete CRUD operations for transactions
 */

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { TransactionInsert, ActivityLogInsert } from '../types/database.types';
import { getAccountById } from '../utils/database.service';

/**
 * Get all transactions for authenticated user
 * GET /api/transactions
 */
export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page = 1, limit = 20, type, startDate, endDate, account_id, category_id } = req.query;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Calculate offset for pagination
  const offset = (Number(page) - 1) * Number(limit);

  // Build query
  let query = supabase
    .from('transactions')
    .select(`
      *,
      account:accounts(id, name, type, logo_url),
      category:categories(id, name, type)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  // Apply filters
  if (type) query = query.eq('type', type);
  if (account_id) query = query.eq('account_id', account_id);
  if (category_id) query = query.eq('category_id', category_id);
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  // Apply pagination
  query = query.range(offset, offset + Number(limit) - 1);

  const { data: transactions, error, count } = await query;

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      transactions: transactions || [],
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
 * Get a single transaction by ID
 * GET /api/transactions/:id
 */
export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const { data: transaction, error } = await supabase
    .from('transactions')
    .select(`
      *,
      account:accounts(id, name, type),
      category:categories(id, name, type)
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !transaction) {
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
 * Create a new transaction
 * POST /api/transactions
 */
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {
    account_id,
    category_id,
    type,
    amount,
    description,
    date,
    notes,
    receipt_url,
  } = req.body;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Verify account belongs to user
  const account = await getAccountById(account_id);
  if (!account || account.user_id !== userId) {
    res.status(403).json({
      success: false,
      message: 'Account not found or does not belong to you',
    });
    return;
  }

  // If category provided, verify it belongs to user
  if (category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .eq('user_id', userId)
      .single();

    if (!category) {
      res.status(403).json({
        success: false,
        message: 'Category not found or does not belong to you',
      });
      return;
    }
  }

  // Create transaction
  const transactionData: TransactionInsert = {
    user_id: userId,
    account_id,
    category_id,
    type,
    amount: Number(amount),
    description,
    date: date || new Date().toISOString().split('T')[0],
    notes,
    receipt_url,
    status: 'completed',
    metadata: null,
    recurring_frequency: null,
    recurring_parent_id: null,
  };

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select(`
      *,
      account:accounts(id, name, type),
      category:categories(id, name, type)
    `)
    .single();

  if (error || !transaction) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
    });
    return;
  }

  // Note: Account balance is automatically updated by database trigger
  // No manual balance update needed here to avoid double counting

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'transaction_created',
    description: `Created ${type} transaction: ${description}`,
  } as ActivityLogInsert);

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction },
  });
});

/**
 * Update a transaction
 * PUT /api/transactions/:id
 */
export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const {
    category_id,
    amount,
    description,
    date,
    notes,
    receipt_url,
  } = req.body;

  // Get existing transaction
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existingTransaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  // Build update data
  const updateData: any = {};
  if (category_id !== undefined) updateData.category_id = category_id;
  if (amount !== undefined) updateData.amount = Number(amount);
  if (description) updateData.description = description;
  if (date) updateData.date = date;
  if (notes !== undefined) updateData.notes = notes;
  if (receipt_url !== undefined) updateData.receipt_url = receipt_url;

  // Update transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      account:accounts(id, name, type),
      category:categories(id, name, type)
    `)
    .single();

  if (error || !transaction) {
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction',
    });
    return;
  }

  // Note: Account balance is automatically updated by database trigger
  // No manual balance update needed here to avoid double counting

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'transaction_updated',
    description: `Updated transaction: ${transaction.description}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    data: { transaction },
  });
});

/**
 * Delete a transaction
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  // Get transaction to adjust balance
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!transaction) {
    res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
    return;
  }

  // Delete transaction
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete transaction',
    });
    return;
  }

  // Note: Account balance is automatically reversed by database trigger
  // No manual balance update needed here to avoid double counting

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'transaction_deleted',
    description: `Deleted transaction: ${transaction.description}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});

/**
 * Get transaction statistics
 * GET /api/transactions/stats
 */
export const getTransactionStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { startDate, endDate } = req.query;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  // Build base query
  let query = supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', userId);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data: transactions } = await query;

  // Calculate statistics
  const stats = {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    incomeCount: 0,
    expenseCount: 0,
    transferCount: 0,
  };

  transactions?.forEach((t) => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      stats.totalIncome += amount;
      stats.incomeCount++;
    } else if (t.type === 'expense') {
      stats.totalExpenses += amount;
      stats.expenseCount++;
    } else if (t.type === 'transfer') {
      stats.transferCount++;
    }
  });

  stats.netCashFlow = stats.totalIncome - stats.totalExpenses;

  res.json({
    success: true,
    data: { stats },
  });
});
