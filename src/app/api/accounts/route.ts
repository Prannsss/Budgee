import { badRequest, ok, serverError, unauthorized } from '@/server/response';
import { db, generateId } from '@/server/store';
import { requireUser } from '@/server/auth';

export async function GET() {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const data = db.accounts.filter(a => a.userId === user.id);
    return ok(data);
  } catch (e: any) {
    return serverError('Failed to fetch accounts', e?.message);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { name, type, balance = 0, lastFour = '----' } = body || {};
    if (!name || !type) return badRequest('Missing required fields');
    const account = { id: generateId('acc'), userId: user.id, name, type, balance, lastFour };
    db.accounts.push(account);
    return ok(account);
  } catch (e: any) {
    return serverError('Failed to create account', e?.message);
  }
}

export async function PUT(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) return badRequest('Account id is required');
    const idx = db.accounts.findIndex(a => a.id === id && a.userId === user.id);
    if (idx === -1) return badRequest('Account not found');
    db.accounts[idx] = { ...db.accounts[idx], ...updates };
    return ok(db.accounts[idx]);
  } catch (e: any) {
    return serverError('Failed to update account', e?.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Account id is required');
    const before = db.accounts.length;
    const toRemove = db.accounts.find(a => a.id === id && a.userId === user.id);
    if (!toRemove) return badRequest('Account not found');
    
    // Remove account and its transactions
    db.accounts.splice(db.accounts.indexOf(toRemove), 1);
    for (let i = db.transactions.length - 1; i >= 0; i--) {
      if (db.transactions[i].userId === user.id && db.transactions[i].accountId === id) {
        db.transactions.splice(i, 1);
      }
    }
    const after = db.accounts.length;
    return ok({ removed: before - after });
  } catch (e: any) {
    return serverError('Failed to delete account', e?.message);
  }
}


