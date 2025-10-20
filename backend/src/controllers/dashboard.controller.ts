import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';

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

  // Get all transactions in period with related data
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*),
      account:accounts(*)
    `)
    .eq('user_id', userId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  if (txError) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    });
    return;
  }

  // Calculate totals
  const totalIncome = (transactions || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // Get account balances
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  const totalBalance = (accounts || []).reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  // Calculate total savings from savings allocations
  const { data: savingsAllocations } = await supabase
    .from('savings_allocations')
    .select('type, amount')
    .eq('user_id', userId);

  const totalSavings = (savingsAllocations || []).reduce((total, alloc) => {
    return alloc.type === 'deposit'
      ? total + Number(alloc.amount)
      : total - Number(alloc.amount);
  }, 0);

  // Group by category
  const expensesByCategory = (transactions || [])
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  const incomeByCategory = (transactions || [])
    .filter(t => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      const categoryName = t.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + (Number(t.amount) || 0);
      return acc;
    }, {});

  // Recent transactions (sort and take top 10)
  const recentTransactions = (transactions || [])
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
        savings: totalSavings,
        transactionCount: (transactions || []).length,
        accountCount: (accounts || []).length,
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

  // Get all transactions from last 6 months
  const { data: transactions } = await supabase
    .from('transactions')
    .select('date, type, amount')
    .eq('user_id', userId)
    .gte('date', sixMonthsAgo.toISOString());

  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Group by month and type manually
  const monthlyMap = new Map<string, { month: string; type: string; total: number }>();

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    // Format: "YYYY-MM-01T00:00:00.000Z" (first day of month)
    const monthKey = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const mapKey = `${monthKey}-${tx.type}`;

    if (!monthlyMap.has(mapKey)) {
      monthlyMap.set(mapKey, {
        month: monthKey,
        type: tx.type,
        total: 0,
      });
    }

    const entry = monthlyMap.get(mapKey)!;
    entry.total += Number(tx.amount) || 0;
  });

  // Convert map to array and sort by month
  return Array.from(monthlyMap.values())
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
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

  // Get all expense transactions in period
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      category_id,
      amount,
      category:categories(id, name, icon)
    `)
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  // Group by category
  interface CategoryData {
    category: unknown;
    total: number;
    count: number;
  }
  
  const spendingMap = new Map<number, CategoryData>();

  (transactions || []).forEach(tx => {
    const categoryId = tx.category_id;
    if (!spendingMap.has(categoryId)) {
      spendingMap.set(categoryId, {
        category: tx.category,
        total: 0,
        count: 0,
      });
    }

    const entry = spendingMap.get(categoryId)!;
    entry.total += Number(tx.amount) || 0;
    entry.count += 1;
  });

  // Convert to array and sort by total descending
  const spending = Array.from(spendingMap.values())
    .sort((a, b) => b.total - a.total);

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

  // Get all income transactions in period
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      category_id,
      amount,
      category:categories(id, name, icon)
    `)
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  // Group by category
  interface IncomeCategoryData {
    category: unknown;
    total: number;
    count: number;
  }
  
  const incomeMap = new Map<number, IncomeCategoryData>();

  (transactions || []).forEach(tx => {
    const categoryId = tx.category_id;
    if (!incomeMap.has(categoryId)) {
      incomeMap.set(categoryId, {
        category: tx.category,
        total: 0,
        count: 0,
      });
    }

    const entry = incomeMap.get(categoryId)!;
    entry.total += Number(tx.amount) || 0;
    entry.count += 1;
  });

  // Convert to array and sort by total descending
  const income = Array.from(incomeMap.values())
    .sort((a, b) => b.total - a.total);

  res.json({
    success: true,
    data: { income },
  });
});
