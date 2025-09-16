import { ok, serverError, unauthorized } from '@/server/response';
import { db } from '@/server/store';
import { requireUser } from '@/server/auth';

export async function GET() {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const txns = db.transactions.filter(t => t.userId === user.id);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const monthly = txns.filter(t => t.date >= monthStart && t.date <= monthEnd);
    const totalIncome = monthly.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(monthly.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

    const byCategory: Record<string, number> = {};
    monthly.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount < 0 ? t.amount : 0);
    });

    const budgetProgress = db.budgets
      .filter(b => b.userId === user.id)
      .map(b => {
        const spent = monthly
          .filter(t => t.category === b.category && t.amount < 0)
          .reduce((s, t) => s + Math.abs(t.amount), 0);
        const percent = b.monthlyLimit > 0 ? Math.min(100, Math.round((spent / b.monthlyLimit) * 100)) : 0;
        return { category: b.category, monthlyLimit: b.monthlyLimit, spent, percent };
      });
    
    return ok({ totals: { totalIncome, totalExpenses, savings: totalIncome - totalExpenses }, byCategory, budgetProgress });
  } catch (e: any) {
    return serverError('Failed to build summary', e?.message);
  }
}


