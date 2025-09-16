import { badRequest, ok, serverError, unauthorized } from '@/server/response';
import { db, generateId } from '@/server/store';
import { requireUser } from '@/server/auth';

export async function GET() {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const data = db.categories.filter(c => c.userId === user.id);
    return ok(data);
  } catch (e: any) {
    return serverError('Failed to fetch categories', e?.message);
  }
}

export async function POST(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { name, type, color = '#999999' } = body || {};
    if (!name || !type) return badRequest('Missing required fields');
    const category = { id: generateId('cat'), userId: user.id, name, type, color, isDefault: false };
    db.categories.push(category);
    return ok(category);
  } catch (e: any) {
    return serverError('Failed to create category', e?.message);
  }
}

export async function PUT(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) return badRequest('Category id is required');
    const idx = db.categories.findIndex(c => c.id === id && c.userId === user.id);
    if (idx === -1) return badRequest('Category not found');
    db.categories[idx] = { ...db.categories[idx], ...updates };
    return ok(db.categories[idx]);
  } catch (e: any) {
    return serverError('Failed to update category', e?.message);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = requireUser();
    if (!user) return unauthorized();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Category id is required');
    const before = db.categories.length;
    for (let i = db.categories.length - 1; i >= 0; i--) {
      if (db.categories[i].id === id && db.categories[i].userId === user.id) {
        db.categories.splice(i, 1);
        break;
      }
    }
    const after = db.categories.length;
    return ok({ removed: before - after });
  } catch (e: any) {
    return serverError('Failed to delete category', e?.message);
  }
}


