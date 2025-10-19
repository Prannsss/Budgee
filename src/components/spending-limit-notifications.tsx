"use client";

import { useEffect, useState, useCallback } from "react";
import API, { type SpendingLimitStatusResponse } from "@/lib/api-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";

export function SpendingLimitNotifications() {
  const [status, setStatus] = useState<SpendingLimitStatusResponse | null>(null);
  const [showExceededModal, setShowExceededModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [exceededLimits, setExceededLimits] = useState<string[]>([]);
  const [warningLimits, setWarningLimits] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  const checkSpendingLimits = useCallback(async () => {
    try {
      // Double-check API availability
      if (!API || !API.spendingLimits || typeof API.spendingLimits.getSpendingLimitStatus !== 'function') {
        console.warn('Spending limits API not available yet');
        return;
      }

      const data = await API.spendingLimits.getSpendingLimitStatus();
      setStatus(data);

      // Filter out limits with amount = 0 (disabled limits)
      // Check for exceeded limits only if limit is set (amount > 0)
      const exceeded = data.limits
        .filter(limit => limit.amount > 0 && limit.is_exceeded)
        .map(limit => limit.type);

      // Check for warning limits (80%+) only if limit is set
      const warnings = data.limits
        .filter(limit => limit.amount > 0 && limit.is_near_limit && !limit.is_exceeded)
        .map(limit => limit.type);

      if (exceeded.length > 0) {
        setExceededLimits(exceeded);
        setShowExceededModal(true);
      } else if (warnings.length > 0) {
        // Only show warning if no exceeded limits
        setWarningLimits(warnings);
        setShowWarningModal(true);
      }
    } catch (error) {
      console.error('Failed to check spending limits:', error);
      // Silently fail - don't disrupt user experience
    }
  }, []);

  useEffect(() => {
    // Only check if API is available and user is likely authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('budgee_token') : null;
    if (!token) {
      console.log('No auth token found, skipping spending limit check');
      return;
    }

    // Small delay to ensure API module is fully loaded
    const initTimeout = setTimeout(() => {
      setIsReady(true);
      checkSpendingLimits();
    }, 1000);

    // Check every 5 minutes after initial load
    const interval = setInterval(checkSpendingLimits, 5 * 60 * 1000);
    
    // Listen for data updates (transactions added/deleted/updated)
    const handleDataUpdate = () => {
      console.log('Data update detected, checking spending limits...');
      checkSpendingLimits();
    };
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [checkSpendingLimits]);

  if (!status) return null;

  return (
    <>
      {/* Warning Modal (80% threshold) */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              <DialogTitle className="text-yellow-800 dark:text-yellow-400">
                Spending Limit Warning
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <p className="text-base">
              You're nearing your spending limit!
            </p>
            {status && (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {warningLimits.map(type => {
                  const limit = status.limits.find(l => l.type === type);
                  return (
                    <li key={type}>
                      <strong>{type}</strong>:{' '}
                      {Math.round(limit?.percentage || 0)}% used ({' '}
                      {new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(limit?.current_spending || 0)}{' '}
                      of{' '}
                      {new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(limit?.amount || 0)}
                      )
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-sm text-muted-foreground pt-2">
              Consider reviewing your expenses to stay within your budget.
            </p>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowWarningModal(false)}
              className="w-full"
            >
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exceeded Limit Modal (100% threshold) */}
      <Dialog open={showExceededModal} onOpenChange={setShowExceededModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
              <DialogTitle className="text-red-800 dark:text-red-400">
                Oh No! Spending Limit Reached!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <p className="text-base">
              You've hit your spending limit for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {exceededLimits.map(type => {
                const limit = status?.limits.find(l => l.type === type);
                return (
                  <li key={type}>
                    <strong>{type}</strong>:{' '}
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(limit?.current_spending || 0)}{' '}
                    /{' '}
                    {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(limit?.amount || 0)}
                  </li>
                );
              })}
            </ul>
            <p className="text-base font-semibold text-red-700 dark:text-red-400 pt-2">
              Do not overspend your money!
            </p>
            <p className="text-sm text-muted-foreground">
              Consider reviewing your expenses or adjusting your budget to stay on track with your financial goals.
            </p>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowExceededModal(false)}
              className="w-full"
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
