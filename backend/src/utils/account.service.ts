import { supabase } from '../config/supabase';
import { Account, AccountInsert } from '../types/database.types';

/**
 * Ensures a user has a default Cash account
 * Creates one if it doesn't exist
 * Returns the Cash account
 */
export async function ensureDefaultCashAccount(userId: number): Promise<Account | null> {
  // Check if user already has a Cash account
  const { data: existingAccount } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('name', 'Cash')
    .eq('is_active', true)
    .single();

  // Return existing account if found
  if (existingAccount) {
    return existingAccount;
  }

  // Create if doesn't exist
  console.log(`Creating default Cash account for user ${userId}`);
  const { data: newAccount, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: 'Cash',
      type: 'Cash',
      balance: 0.00,
      is_manual: true, // Manual account (not connected to any institution)
      is_active: true,
      verified: true,
    } as AccountInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating Cash account:', error);
    return null;
  }

  return newAccount;
}

/**
 * Create default Cash account for a user
 * Used during email verification
 */
export async function createDefaultCashAccount(userId: number): Promise<Account | null> {
  // Use ensureDefaultCashAccount to prevent duplicates
  return ensureDefaultCashAccount(userId);
}
