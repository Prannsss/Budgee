import { Account } from '../models';

/**
 * Ensures a user has a default Cash account
 * Creates one if it doesn't exist
 * Returns the Cash account
 */
export async function ensureDefaultCashAccount(userId: number): Promise<Account> {
  // Check if user already has a Cash account
  let cashAccount = await Account.findOne({
    where: {
      user_id: userId,
      name: 'Cash',
      is_active: true,
    },
  });

  // Create if doesn't exist
  if (!cashAccount) {
    console.log(`Creating default Cash account for user ${userId}`);
    cashAccount = await Account.create({
      user_id: userId,
      name: 'Cash',
      type: 'Cash',
      balance: 0.00,
      is_manual: true, // Manual account (not connected to any institution)
      is_active: true,
    });
  }

  return cashAccount;
}

/**
 * Create default Cash account for a user
 * Used during email verification
 */
export async function createDefaultCashAccount(userId: number): Promise<Account> {
  // Use ensureDefaultCashAccount to prevent duplicates
  return ensureDefaultCashAccount(userId);
}
