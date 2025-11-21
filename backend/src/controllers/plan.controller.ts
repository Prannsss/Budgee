import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Get all plans
 * GET /api/plans
 */
export const getAllPlans = asyncHandler(async (_req: Request, res: Response) => {
  const { data: plans, error } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
    });
    return;
  }

  res.json({
    success: true,
    data: { plans: plans || [] },
  });
});

/**
 * Get single plan
 * GET /api/plans/:id
 */
export const getPlanById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: plan, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !plan) {
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
  const userId = req.user?.id!;
  const { plan_id } = req.body;

  // Validate plan exists
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('*')
    .eq('id', plan_id)
    .single();

  if (planError || !plan) {
    res.status(404).json({
      success: false,
      message: 'Plan not found',
    });
    return;
  }

  // Get user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
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
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      plan_id,
      subscription_upgraded_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) {
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade plan',
    });
    return;
  }

  // Get updated user with plan details
  const { data: updatedUser } = await supabase
    .from('users')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('id', userId)
    .single();

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'plan_upgraded',
    description: `Upgraded to ${plan.name} plan`,
    entity_type: 'plan',
    entity_id: plan_id
  });

  res.json({
    success: true,
    message: 'Plan upgraded successfully',
    data: { user: updatedUser },
  });
});
