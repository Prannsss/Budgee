import { badRequest, ok, serverError, unauthorized } from '@/server/response';
import { db, generateId } from '@/server/store';
import { requireUser } from '@/server/auth';

export async function GET(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const category = searchParams.get('category');

    let data = db.transactions.filter(t => t.userId === user.id);
    if (start && end) data = data.filter(t => t.date >= start && t.date <= end);
    if (category) data = data.filter(t => t.category === category);
    return ok(data);
  } catch (e: any) {
    return serverError('Failed to fetch transactions', e?.message);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { description, amount, category, accountId, date, notes } = body || {};
    if (!description || typeof amount !== 'number' || !category || !accountId) {
      return badRequest('Missing required fields');
    }
    const txn = {
      id: generateId('txn'),
      userId: user.id,
      description,
      amount,
      category,
      accountId,
      date: date || new Date().toISOString().split('T')[0],
      status: 'completed' as const,
      notes,
    };
    db.transactions.push(txn);
    return ok(txn);
  } catch (e: any) {
    return serverError('Failed to create transaction', e?.message);
  }
}

export async function PUT(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) return badRequest('Transaction id is required');
    const idx = db.transactions.findIndex(t => t.id === id && t.userId === user.id);
    if (idx === -1) return badRequest('Transaction not found');
    db.transactions[idx] = { ...db.transactions[idx], ...updates };
    return ok(db.transactions[idx]);
  } catch (e: any) {
    return serverError('Failed to update transaction', e?.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Transaction id is required');
    const before = db.transactions.length;
    for (let i = db.transactions.length - 1; i >= 0; i--) {
      if (db.transactions[i].id === id && db.transactions[i].userId === user.id) {
        db.transactions.splice(i, 1);
        break;
      }
    }
    const after = db.transactions.length;
    return ok({ removed: before - after });
  } catch (e: any) {
    return serverError('Failed to delete transaction', e?.message);
  }
}


