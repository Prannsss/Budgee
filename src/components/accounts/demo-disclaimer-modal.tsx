"use client";

import * as React from "react";
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
import { AlertTriangle, Info } from "lucide-react";
import { DEMO_UX_COPY } from "@/lib/demo-bank-service";

interface DemoDisclaimerModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onCancel: () => void;
  bankName?: string;
}

/**
 * Demo Disclaimer Modal
 * 
 * A non-dismissible modal that users must acknowledge before proceeding
 * with a demo bank connection. This ensures transparency about the
 * simulated nature of the feature.
 */
export function DemoDisclaimerModal({
  isOpen,
  onContinue,
  onCancel,
  bankName,
}: DemoDisclaimerModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-[420px] gap-6">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <Info className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">
              {DEMO_UX_COPY.disclaimer.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {DEMO_UX_COPY.disclaimer.message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Visual emphasis box */}
        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-900 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">What this means:</span>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Sample transactions will be generated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Balances are simulated, not real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>No actual bank credentials are stored</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>Perfect for exploring the app's features</span>
            </li>
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onContinue}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {DEMO_UX_COPY.disclaimer.continueButton}
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel} className="w-full">
            {DEMO_UX_COPY.disclaimer.cancelButton}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
