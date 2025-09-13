"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type PlanType = 'Free' | 'Basic' | 'Premium';

interface SubscriptionContextType {
  currentPlan: PlanType;
  setCurrentPlan: (plan: PlanType) => void;
  isAIEnabled: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('Free');

  const isAIEnabled = currentPlan !== 'Free';

  return (
    <SubscriptionContext.Provider 
      value={{ 
        currentPlan, 
        setCurrentPlan, 
        isAIEnabled 
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
