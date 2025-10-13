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
    data: { categories },
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
    data: { category },
  });
});

/**
 * Create new category
 * POST /api/categories
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { name, type, icon, color } = req.body;

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

  // Create category
  const category = await Category.create({
    user_id: userId,
    name,
    type,
    icon,
    color,
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
    data: { category },
  });
});

/**
 * Update category
 * PUT /api/categories/:id
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id!;
  const { id } = req.params;
  const { name, icon, color } = req.body;

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

  // Update fields
  const updateData: any = {};
  if (name) updateData.name = name;
  if (icon) updateData.icon = icon;
  if (color) updateData.color = color;

  await category.update(updateData);

  // Log activity
  await ActivityLog.create({
    user_id: userId,
    action: 'category_updated',
    description: `Updated category: ${category.name}`,
  });

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
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
