"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API } from '@/lib/api-service';
import { useAuth } from './auth-context';
import type { PlanType } from '@/lib/types';

interface SubscriptionContextType {
  currentPlan: PlanType;
  userPlan: any | null;
  setCurrentPlan: (plan: PlanType) => Promise<void>;
  isAIEnabled: boolean;
  hasAIBuddyAccess: boolean;
  isLoading: boolean;
  getAccountLimits: () => { maxTotal: number; maxWallets: number; maxAccounts: number };
  canConnectAccount: (currentAccounts: { wallets: number; banks: number }) => { 
    canConnect: boolean; 
    limitType: 'wallets' | 'banks' | 'total' | null;
    message: string;
  };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlanState] = useState<PlanType>('Free');
  const [userPlan, setUserPlan] = useState<any | null>(null);
  const [hasAIBuddyAccess, setHasAIBuddyAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user plan data from backend when user changes
  useEffect(() => {
    const loadUserPlan = async () => {
      if (!user?.id) {
        setCurrentPlanState('Free');
        setUserPlan(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get user profile with plan information
        const userProfile = await API.user.getProfile();
        
        if (userProfile.plan) {
          setUserPlan(userProfile.plan);
          setCurrentPlanState(userProfile.plan.name as PlanType);
        } else {
          // Fallback to Free plan if no plan info
          setCurrentPlanState('Free');
          setUserPlan(null);
        }

        // Set AI buddy access status from backend
        setHasAIBuddyAccess(userProfile.hasAIBuddyAccess || false);
      } catch (error) {
        console.error('Error loading user plan:', error);
        setCurrentPlanState('Free');
        setUserPlan(null);
        setHasAIBuddyAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPlan();
  }, [user?.id]);

  const setCurrentPlan = async (planName: PlanType) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Map plan name to plan ID (1=Free, 2=Budgeet, 3=Premium)
      const planIdMap: Record<PlanType, number> = {
        'Free': 1,
        'Budgeet': 2,
        'Premium': 3,
      };
      
      const planId = planIdMap[planName];
      if (!planId) {
        throw new Error(`Invalid plan name: ${planName}`);
      }
      
      // Use the plan upgrade API with plan ID
      await API.plans.upgrade(planId);
      
      // Refresh user profile to get updated plan
      const userProfile = await API.user.getProfile();
      if (userProfile.plan) {
        setUserPlan(userProfile.plan);
        setCurrentPlanState(userProfile.plan.name as PlanType);
      }
      
      // Update AI buddy access
      setHasAIBuddyAccess(userProfile.hasAIBuddyAccess || false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  const isAIEnabled = currentPlan !== 'Free';

  // Account limits based on user's plan from database
  // The plan has max_wallets and max_accounts, we use the total of both as the max
  const getAccountLimits = () => {
    if (userPlan) {
      // Use actual plan limits from database
      // For simplicity, we use max_accounts as the total limit (since we want combined limit)
      // Free: 2 total, Budgeet: 5 total, Premium: 15+ (effectively unlimited for most users)
      const maxWallets = userPlan.maxWallets || userPlan.max_wallets || 1;
      const maxAccounts = userPlan.maxAccounts || userPlan.max_accounts || 1;
      
      // For combined total limit, use the larger of the two as the total
      // Or sum them for true total (Free: 2, Budgeet: 10, Premium: 25)
      // Based on user requirement: Free=2, Budgeet=5, Premium=unlimited
      // We'll use max_accounts as the total limit since that's what makes sense
      let maxTotal: number;
      if (currentPlan === 'Premium') {
        maxTotal = -1; // Unlimited for premium
      } else if (currentPlan === 'Budgeet') {
        maxTotal = 5; // Budgeet allows 5 total
      } else {
        maxTotal = 2; // Free allows 2 total
      }
      
      return { maxTotal, maxWallets, maxAccounts };
    }
    
    // Fallback based on plan name if userPlan not loaded
    switch (currentPlan) {
      case 'Free':
        return { maxTotal: 2, maxWallets: 1, maxAccounts: 1 };
      case 'Budgeet':
        return { maxTotal: 5, maxWallets: 5, maxAccounts: 5 };
      case 'Premium':
        return { maxTotal: -1, maxWallets: -1, maxAccounts: -1 }; // Unlimited
      default:
        return { maxTotal: 2, maxWallets: 1, maxAccounts: 1 };
    }
  };

  // Check if user can connect more accounts
  const canConnectAccount = (currentAccounts: { wallets: number; banks: number }) => {
    const limits = getAccountLimits();
    const totalAccounts = currentAccounts.wallets + currentAccounts.banks;

    // Premium plan - unlimited
    if (limits.maxTotal === -1) {
      return { canConnect: true, limitType: null, message: '' };
    }

    // Check total account limit
    if (totalAccounts >= limits.maxTotal) {
      return { 
        canConnect: false, 
        limitType: 'total' as const, 
        message: `You can only connect up to ${limits.maxTotal} accounts on the ${currentPlan} plan.` 
      };
    }

    return { canConnect: true, limitType: null, message: '' };
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        currentPlan, 
        userPlan,
        setCurrentPlan, 
        isAIEnabled,
        hasAIBuddyAccess,
        isLoading,
        getAccountLimits,
        canConnectAccount,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
