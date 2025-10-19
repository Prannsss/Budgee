import { supabase } from '../config/supabase';
import { SpendingLimit, SpendingLimitInsert } from '../types/database.types';

/**
 * Service for managing spending limits
 * Handles automatic updates and resets
 */

export class SpendingLimitService {
  /**
   * Update spending limits after a transaction is created/updated/deleted
   * Recalculates current_spending for all limit types
   */
  static async updateSpendingLimits(userId: number): Promise<void> {
    const now = new Date();

    // Get all spending limits for the user
    const { data: limits } = await supabase
      .from('spending_limits')
      .select('*')
      .eq('user_id', userId);

    if (!limits || limits.length === 0) return;

    for (const limit of limits) {
      // Check if limit needs to be reset based on time elapsed
      await this.checkAndResetLimit(limit);

      // Calculate date range based on limit type
      const startDate = this.getStartDateForLimitType(limit.type, new Date(limit.last_reset));

      // Calculate total expense spending within the date range
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('status', 'completed')
        .gte('date', startDate.toISOString())
        .lte('date', now.toISOString());

      const totalSpending = (transactions || []).reduce((sum, tx) => sum + Number(tx.amount), 0);

      // Update current_spending
      await supabase
        .from('spending_limits')
        .update({ current_spending: totalSpending })
        .eq('id', limit.id);
    }
  }

  /**
   * Check if a limit should be reset based on time elapsed
   */
  static async checkAndResetLimit(limit: SpendingLimit): Promise<void> {
    const now = new Date();
    const lastReset = new Date(limit.last_reset);
    let shouldReset = false;

    switch (limit.type) {
      case 'Daily':
        // Reset if more than 24 hours have passed
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        shouldReset = hoursSinceReset >= 24;
        break;

      case 'Weekly':
        // Reset if more than 7 days have passed
        const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
        shouldReset = daysSinceReset >= 7;
        break;

      case 'Monthly':
        // Reset if we're in a new month
        shouldReset =
          lastReset.getMonth() !== now.getMonth() ||
          lastReset.getFullYear() !== now.getFullYear();
        break;
    }

    if (shouldReset) {
      await supabase
        .from('spending_limits')
        .update({
          current_spending: 0,
          last_reset: now.toISOString(),
        })
        .eq('id', limit.id);
    }
  }

  /**
   * Get the start date for calculating spending based on limit type
   */
  static getStartDateForLimitType(
    type: 'Daily' | 'Weekly' | 'Monthly',
    lastReset: Date
  ): Date {
    const resetDate = new Date(lastReset);
    const now = new Date();

    switch (type) {
      case 'Daily':
        // Last 24 hours from last reset
        return resetDate;

      case 'Weekly':
        // Last 7 days from last reset
        return resetDate;

      case 'Monthly':
        // Current month or from last reset if within same month
        if (
          resetDate.getMonth() === now.getMonth() &&
          resetDate.getFullYear() === now.getFullYear()
        ) {
          return resetDate;
        }
        // Start of current month
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /**
   * Check all limits for a user and reset if needed
   * Can be called periodically or on app startup
   */
  static async checkAndResetAllUserLimits(userId: number): Promise<void> {
    const { data: limits } = await supabase
      .from('spending_limits')
      .select('*')
      .eq('user_id', userId);

    if (!limits) return;

    for (const limit of limits) {
      await this.checkAndResetLimit(limit);
    }

    // After resetting, update the spending to reflect current period
    await this.updateSpendingLimits(userId);
  }

  /**
   * Initialize default spending limits for a new user
   */
  static async initializeDefaultLimits(userId: number): Promise<SpendingLimit[]> {
    const defaults: SpendingLimitInsert[] = [
      { user_id: userId, type: 'Daily', amount: 0, current_spending: 0 },
      { user_id: userId, type: 'Weekly', amount: 0, current_spending: 0 },
      { user_id: userId, type: 'Monthly', amount: 0, current_spending: 0 },
    ];

    const limits: SpendingLimit[] = [];

    for (const defaultLimit of defaults) {
      // Check if limit already exists
      const { data: existing } = await supabase
        .from('spending_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('type', defaultLimit.type)
        .single();

      if (existing) {
        limits.push(existing);
      } else {
        const { data: newLimit } = await supabase
          .from('spending_limits')
          .insert(defaultLimit)
          .select()
          .single();

        if (newLimit) {
          limits.push(newLimit);
        }
      }
    }

    return limits;
  }

  /**
   * Helper methods for spending limit calculations
   */
  static getPercentageUsed(limit: SpendingLimit): number {
    if (Number(limit.amount) === 0) return 0;
    return (Number(limit.current_spending) / Number(limit.amount)) * 100;
  }

  static isExceeded(limit: SpendingLimit): boolean {
    return Number(limit.current_spending) > Number(limit.amount) && Number(limit.amount) > 0;
  }

  static isNearLimit(limit: SpendingLimit, threshold: number = 80): boolean {
    return this.getPercentageUsed(limit) >= threshold && !this.isExceeded(limit);
  }

  static getRemainingAmount(limit: SpendingLimit): number {
    const remaining = Number(limit.amount) - Number(limit.current_spending);
    return remaining >= 0 ? remaining : 0;
  }
}

export default SpendingLimitService;
