import { SpendingLimit, Transaction } from '../models';
import { Op } from 'sequelize';

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
    const limits = await SpendingLimit.findAll({
      where: { user_id: userId },
    });

    for (const limit of limits) {
      // Check if limit needs to be reset based on time elapsed
      await this.checkAndResetLimit(limit);

      // Calculate date range based on limit type
      const startDate = this.getStartDateForLimitType(limit.type, limit.last_reset);
      
      // Calculate total expense spending within the date range
      const totalSpending = await Transaction.sum('amount', {
        where: {
          user_id: userId,
          type: 'expense',
          status: 'completed',
          date: {
            [Op.gte]: startDate,
            [Op.lte]: now,
          },
        },
      });

      // Update current_spending
      limit.current_spending = totalSpending || 0;
      await limit.save();
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
        shouldReset = lastReset.getMonth() !== now.getMonth() || 
                     lastReset.getFullYear() !== now.getFullYear();
        break;
    }

    if (shouldReset) {
      limit.current_spending = 0;
      limit.last_reset = now;
      await limit.save();
    }
  }

  /**
   * Get the start date for calculating spending based on limit type
   */
  static getStartDateForLimitType(type: 'Daily' | 'Weekly' | 'Monthly', lastReset: Date): Date {
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
        if (resetDate.getMonth() === now.getMonth() && 
            resetDate.getFullYear() === now.getFullYear()) {
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
    const limits = await SpendingLimit.findAll({
      where: { user_id: userId },
    });

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
    const defaults = [
      { user_id: userId, type: 'Daily' as const, amount: 0, current_spending: 0 },
      { user_id: userId, type: 'Weekly' as const, amount: 0, current_spending: 0 },
      { user_id: userId, type: 'Monthly' as const, amount: 0, current_spending: 0 },
    ];

    const limits: SpendingLimit[] = [];
    for (const defaultLimit of defaults) {
      const [limit] = await SpendingLimit.findOrCreate({
        where: { 
          user_id: userId,
          type: defaultLimit.type,
        },
        defaults: defaultLimit,
      });
      limits.push(limit);
    }

    return limits;
  }
}

export default SpendingLimitService;
