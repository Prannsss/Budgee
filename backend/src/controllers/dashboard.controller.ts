import { Request, Response } from 'express';
import { Transaction, Account, Category, SavingsAllocation } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize';

/**
 * Get dashboard summary
 * GET /api/dashboard
 */
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { period = 'month' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  // Get all transactions in period
  const transactions = await Transaction.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    include: [
      { model: Category, as: 'category' },
      { model: Account, as: 'account' },
    ],
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = (Number(totalIncome) || 0) - (Number(totalExpense) || 0);

  // Get account balances
  const accounts = await Account.findAll({
    where: { user_id: userId, is_active: true },
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  // Calculate total savings from savings allocations
  const savingsAllocations = await SavingsAllocation.findAll({
    where: { user_id: userId },
    attributes: ['type', 'amount'],
  });

  const totalSavings = savingsAllocations.reduce((total, alloc) => {
    return alloc.type === 'deposit' 
      ? total + Number(alloc.amount)
      : total - Number(alloc.amount);
  }, 0);

  // Group by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: any, t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  // Recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Monthly trend (last 6 months)
  const monthlyData = await getMonthlyTrend(userId!);

  res.json({
    success: true,
    data: {
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
        totalBalance,
        savings: totalSavings, // Add savings to response
        transactionCount: transactions.length,
        accountCount: accounts.length,
      },
      categoryBreakdown: {
        expenses: expensesByCategory,
        income: incomeByCategory,
      },
      recentTransactions,
      monthlyTrend: monthlyData,
      period,
    },
  });
});

/**
 * Get monthly income/expense trend
 */
const getMonthlyTrend = async (userId: number) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await Transaction.findAll({
    where: {
      user_id: userId,
      date: {
        [Op.gte]: sixMonthsAgo,
      },
    },
    attributes: [
      [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'month'],
      'type',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
    ],
    group: ['month', 'type'],
    order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date')), 'ASC']],
    raw: true,
  });

  return transactions;
};

/**
 * Get spending by category
 * GET /api/dashboard/spending-by-category
 */
export const getSpendingByCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { period = 'month' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const spending = await Transaction.findAll({
    where: {
      user_id: userId,
      type: 'expense',
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    include: [{ model: Category, as: 'category' }],
    attributes: [
      'category_id',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count'],
    ],
    group: ['category_id', 'category.id', 'category.name', 'category.icon'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: false,
  });

  res.json({
    success: true,
    data: { spending },
  });
});

/**
 * Get income by source
 * GET /api/dashboard/income-by-source
 */
export const getIncomeBySource = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { period = 'month' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const income = await Transaction.findAll({
    where: {
      user_id: userId,
      type: 'income',
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    },
    include: [{ model: Category, as: 'category' }],
    attributes: [
      'category_id',
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count'],
    ],
    group: ['category_id', 'category.id', 'category.name', 'category.icon'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: false,
  });

  res.json({
    success: true,
    data: { income },
  });
});
