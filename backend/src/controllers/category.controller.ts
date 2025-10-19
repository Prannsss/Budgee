/**
 * Category Controller with Supabase
 * Complete CRUD operations for transaction categories
 */

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';
import { CategoryInsert, ActivityLogInsert } from '../types/database.types';

/**
 * Get all categories for authenticated user
 * GET /api/categories
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { type } = req.query;

  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data: categories, error } = await query;

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
    return;
  }

  res.json({
    success: true,
    data: categories || [],
  });
});

/**
 * Get single category
 * GET /api/categories/:id
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !category) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  res.json({
    success: true,
    data: category,
  });
});

/**
 * Create new category
 * POST /api/categories
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { name, type } = req.body;

  // Check if category already exists for this user
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('type', type)
    .single();

  if (existingCategory) {
    res.status(409).json({
      success: false,
      message: 'Category with this name already exists',
    });
    return;
  }

  // Create category
  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      type,
      is_default: false,
    } as CategoryInsert)
    .select()
    .single();

  if (error || !category) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'category_created',
    description: `Created ${type} category: ${name}`,
  } as ActivityLogInsert);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const { name } = req.body;

  // Get category
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existingCategory) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  // Prevent updating default categories
  if (existingCategory.is_default) {
    res.status(403).json({
      success: false,
      message: 'Cannot modify default categories',
    });
    return;
  }

  // Update category
  const { data: category, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single();

  if (error || !category) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'category_updated',
    description: `Updated category: ${category.name}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

/**
 * Delete category
 * DELETE /api/categories/:id
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;

  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  // Check if category has transactions
  const { count: transactionCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (transactionCount && transactionCount > 0) {
    res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${transactionCount} transaction(s) associated with it.`,
    });
    return;
  }

  // Delete category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
    });
    return;
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'category_deleted',
    description: `Deleted category: ${category.name}`,
  } as ActivityLogInsert);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

/**
 * Initialize default categories for a new user
 * This function should be called when a user signs up
 */
export const initializeDefaultCategories = async (userId: number): Promise<void> => {
  try {
    // Income Categories
    const incomeCategories = [
      { user_id: userId, name: 'Salary', type: 'income' as const, is_default: false },
      { user_id: userId, name: 'Miscellaneous', type: 'income' as const, is_default: false },
    ];

    // Expense Categories
    const expenseCategories = [
      { user_id: userId, name: 'Food', type: 'expense' as const, is_default: false },
      { user_id: userId, name: 'Transportation', type: 'expense' as const, is_default: false },
      { user_id: userId, name: 'Rent', type: 'expense' as const, is_default: false },
      { user_id: userId, name: 'Utilities', type: 'expense' as const, is_default: false },
      { user_id: userId, name: 'Entertainment', type: 'expense' as const, is_default: false },
      { user_id: userId, name: 'Miscellaneous', type: 'expense' as const, is_default: false },
    ];

    // Bulk create all default categories
    const { error } = await supabase
      .from('categories')
      .insert([...incomeCategories, ...expenseCategories]);

    if (error) {
      throw error;
    }
    
    console.log(`✓ Default categories initialized for user ${userId}`);
  } catch (error) {
    console.error('Error initializing default categories:', error);
    throw error;
  }
};
