import { badRequest, ok, serverError, unauthorized } from '@/server/response';
import { db, generateId } from '@/server/store';
import { requireUser } from '@/server/auth';

export async function GET() {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const data = db.budgets.filter(b => b.userId === user.id);
    return ok(data);
  } catch (e: any) {
    return serverError('Failed to fetch budgets', e?.message);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { category, monthlyLimit } = body || {};
    if (!category || typeof monthlyLimit !== 'number') return badRequest('Missing required fields');
    const budget = { id: generateId('bud'), userId: user.id, category, monthlyLimit };
    db.budgets.push(budget);
    return ok(budget);
  } catch (e: any) {
    return serverError('Failed to create budget', e?.message);
  }
}

export async function PUT(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) return badRequest('Budget id is required');
    const idx = db.budgets.findIndex(b => b.id === id && b.userId === user.id);
    if (idx === -1) return badRequest('Budget not found');
    db.budgets[idx] = { ...db.budgets[idx], ...updates };
    return ok(db.budgets[idx]);
  } catch (e: any) {
    return serverError('Failed to update budget', e?.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Budget id is required');
    const before = db.budgets.length;
    for (let i = db.budgets.length - 1; i >= 0; i--) {
      if (db.budgets[i].id === id && db.budgets[i].userId === user.id) {
        db.budgets.splice(i, 1);
        break;
      }
    }
    const after = db.budgets.length;
    return ok({ removed: before - after });
  } catch (e: any) {
    return serverError('Failed to delete budget', e?.message);
  }
}


