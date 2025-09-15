"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TransactionService } from '@/lib/storage-service';
import { useAuth } from './auth-context';
import type { PlanType, Subscription } from '@/lib/types';

interface SubscriptionContextType {
  currentPlan: PlanType;
  subscription: Subscription | null;
  setCurrentPlan: (plan: PlanType) => void;
  isAIEnabled: boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlanState] = useState<PlanType>('Free');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load subscription data when user changes
  useEffect(() => {
    if (!user?.id) {
      setCurrentPlanState('Free');
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const loadSubscription = () => {
      const userSubscription = TransactionService.getUserSubscription(user.id);
      if (userSubscription) {
        setCurrentPlanState(userSubscription.planType);
        setSubscription(userSubscription);
      } else {
        // Create default free subscription for new users
        const newSubscription = TransactionService.createOrUpdateSubscription(user.id, 'Free');
        setCurrentPlanState('Free');
        setSubscription(newSubscription);
      }
      setIsLoading(false);
    };

    loadSubscription();
  }, [user?.id]);

  const setCurrentPlan = (plan: PlanType) => {
    if (!user?.id) return;
    
    // Update localStorage
    const updatedSubscription = TransactionService.createOrUpdateSubscription(user.id, plan);
    
    // Update local state
    setCurrentPlanState(plan);
    setSubscription(updatedSubscription);
  };

  const isAIEnabled = currentPlan !== 'Free';

  return (
    <SubscriptionContext.Provider 
      value={{ 
        currentPlan, 
        subscription,
        setCurrentPlan, 
        isAIEnabled,
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
