"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PlanType } from "@/lib/types";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanType;
  limitType: "accounts" | "wallets" | "banks";
}

const PLAN_DETAILS: Record<PlanType, {
  nextPlan: PlanType | null;
  nextPlanPrice: string;
  currentLimit: number;
  nextLimit: number | null; // -1 means unlimited
}> = {
  'Free': {
    nextPlan: 'Budgeet',
    nextPlanPrice: '₱199/month',
    currentLimit: 2, // 2 total accounts
    nextLimit: 5,
  },
  'Budgeet': {
    nextPlan: 'Premium',
    nextPlanPrice: '₱399/month',
    currentLimit: 5,
    nextLimit: -1, // -1 means unlimited
  },
  'Premium': {
    nextPlan: null,
    nextPlanPrice: '',
    currentLimit: -1, // unlimited
    nextLimit: null,
  },
};

export function UpgradePlanModal({ 
  open, 
  onOpenChange, 
  currentPlan,
  limitType 
}: UpgradePlanModalProps) {
  const router = useRouter();
  const planDetails = PLAN_DETAILS[currentPlan];
  
  if (!planDetails.nextPlan) {
    // User is already on Premium - shouldn't happen but handle gracefully
    return null;
  }

  const getLimitText = () => {
    return `You can only connect up to ${planDetails.currentLimit} accounts on the ${currentPlan} plan.`;
  };

  const getNextLimitText = () => {
    if (planDetails.nextLimit === -1) {
      return "unlimited bank and e-wallet accounts";
    }
    return `up to ${planDetails.nextLimit} bank or e-wallet accounts`;
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push('/pricing');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              Upgrade to {planDetails.nextPlan} Plan
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-base space-y-3">
              <p className="text-foreground font-medium">
                You&apos;ve reached your account connection limit!
              </p>
              <p className="text-muted-foreground">
                {getLimitText()}
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 text-primary font-medium mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{planDetails.nextPlan} Plan Benefits</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Connect {getNextLimitText()}</li>
                  {planDetails.nextPlan === 'Budgeet' && (
                    <>
                      <li>• AI-powered financial insights</li>
                      <li>• Advanced categorization rules</li>
                      <li>• Export transactions to CSV/Excel</li>
                    </>
                  )}
                  {planDetails.nextPlan === 'Premium' && (
                    <>
                      <li>• Full AI financial assistant access</li>
                      <li>• Investment and savings tracking</li>
                      <li>• Custom financial reports</li>
                      <li>• Priority customer support</li>
                    </>
                  )}
                </ul>
                <p className="text-sm font-medium text-primary mt-3">
                  Only {planDetails.nextPlanPrice}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade} className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
