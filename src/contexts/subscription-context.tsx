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

  const setCurrentPlan = async (planId: PlanType) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Use the plan upgrade API
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
    } finally {
      setIsLoading(false);
    }
  };

  const isAIEnabled = currentPlan !== 'Free';

  return (
    <SubscriptionContext.Provider 
      value={{ 
        currentPlan, 
        userPlan,
        setCurrentPlan, 
        isAIEnabled,
        hasAIBuddyAccess,
        isLoading
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
