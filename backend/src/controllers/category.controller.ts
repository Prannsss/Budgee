import { Request, Response } from 'express';
import { Category, ActivityLog } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Get all categories for authenticated user
 * GET /api/categories
 */
export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { type } = req.query;

  const where: any = { user_id: userId };
  if (type) where.type = type;

  const categories = await Category.findAll({
    where,
    order: [['name', 'ASC']],
  });

  res.json({
    success: true,
    data: categories,
  });
});

/**
 * Get single category
 * GET /api/categories/:id
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const category = await Category.findOne({
    where: { id, user_id: userId },
  });

  if (!category) {
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
  const existingCategory = await Category.findOne({
    where: { user_id: userId, name, type },
  });

  if (existingCategory) {
    res.status(409).json({
      success: false,
      message: 'Category with this name already exists',
    });
    return;
  }

  // Create category (is_default will be false by default for user-created categories)
  const category = await Category.create({
    user_id: userId,
    name,
    type,
    is_default: false, // User-created categories are not default
  });

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'category_created',
    description: `Created ${type} category: ${name}`,
  });

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

  const category = await Category.findOne({
    where: { id, user_id: userId },
  });

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  // Prevent updating default categories
  if (category.is_default) {
    res.status(403).json({
      success: false,
      message: 'Cannot modify default categories',
    });
    return;
  }

  // Update name if provided
  if (name) {
    await category.update({ name });
  }

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'category_updated',
    description: `Updated category: ${category.name}`,
  });

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

  const category = await Category.findOne({
    where: { id, user_id: userId },
  });

  if (!category) {
    res.status(404).json({
      success: false,
      message: 'Category not found',
    });
    return;
  }

  // Prevent deleting default categories
  if (category.is_default) {
    res.status(403).json({
      success: false,
      message: 'Cannot delete default categories',
    });
    return;
  }

  // Note: Transactions referencing this category will fail due to foreign key constraint
  // You might want to handle this differently (e.g., move to "Uncategorized")
  await category.destroy();

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'category_deleted',
    description: `Deleted category: ${category.name}`,
  });

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
      { user_id: userId, name: 'Salary', type: 'income' as const, is_default: true },
      { user_id: userId, name: 'Miscellaneous', type: 'income' as const, is_default: true },
    ];

    // Expense Categories
    const expenseCategories = [
      { user_id: userId, name: 'Food', type: 'expense' as const, is_default: true },
      { user_id: userId, name: 'Transportation', type: 'expense' as const, is_default: true },
      { user_id: userId, name: 'Rent', type: 'expense' as const, is_default: true },
      { user_id: userId, name: 'Utilities', type: 'expense' as const, is_default: true },
      { user_id: userId, name: 'Entertainment', type: 'expense' as const, is_default: true },
      { user_id: userId, name: 'Miscellaneous', type: 'expense' as const, is_default: true },
    ];

    // Bulk create all default categories
    await Category.bulkCreate([...incomeCategories, ...expenseCategories]);
    
    console.log(`✓ Default categories initialized for user ${userId}`);
  } catch (error) {
    console.error('Error initializing default categories:', error);
    throw error;
  }
};
