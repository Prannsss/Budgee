import { Request, Response } from 'express';
import { Plan, User } from '../models';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Get all plans
 * GET /api/plans
 */
export const getAllPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await Plan.findAll({
    order: [['price', 'ASC']],
  });

  res.json({
    success: true,
    data: { plans },
  });
});

/**
 * Get single plan
 * GET /api/plans/:id
 */
export const getPlanById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const plan = await Plan.findByPk(id);

  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Plan not found',
    });
    return;
  }

  res.json({
    success: true,
    data: { plan },
  });
});

/**
 * Upgrade/change user plan
 * POST /api/plans/upgrade
 */
export const upgradePlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { plan_id } = req.body;

  // Validate plan exists
  const plan = await Plan.findByPk(plan_id);
  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Plan not found',
    });
    return;
  }

  // Get user
  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  // Check if already on this plan
  if (user.plan_id === plan_id) {
    res.status(400).json({
      success: false,
      message: 'You are already on this plan',
    });
    return;
  }

  // Update user plan
  await user.update({ plan_id });

  // Get updated user with plan details
  const updatedUser = await User.findByPk(userId, {
    include: [{ model: Plan, as: 'plan' }],
  });

  res.json({
    success: true,
    message: 'Plan upgraded successfully',
    data: { user: updatedUser },
  });
});
