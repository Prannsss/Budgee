"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface SpendingProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  limitAmount?: number;
  showTooltip?: boolean;
}

const SpendingProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  SpendingProgressProps
>(({ className, value = 0, limitAmount = 0, showTooltip = false, ...props }, ref) => {
  // If limit is 0 or not set, show empty bar
  const displayValue = limitAmount > 0 ? value : 0;
  
  // Determine color based on percentage
  const getBarColor = () => {
    if (limitAmount <= 0) {
      return "bg-muted"; // Disabled/no limit
    }
    
    const percentage = value || 0;
    
    if (percentage >= 100) {
      return "bg-red-500 dark:bg-red-600"; // Exceeded
    } else if (percentage >= 80) {
      return "bg-yellow-500 dark:bg-yellow-600"; // Warning
    } else {
      return "bg-primary"; // Normal
    }
  };

  const getStatusMessage = () => {
    if (limitAmount <= 0) {
      return "No limit set";
    }
    
    const percentage = value || 0;
    
    if (percentage >= 100) {
      return "Limit exceeded!";
    } else if (percentage >= 80) {
      return "Nearing limit";
    } else {
      return "Within limit";
    }
  };

  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-in-out",
            getBarColor()
          )}
          style={{ transform: `translateX(-${100 - displayValue}%)` }}
        />
      </ProgressPrimitive.Root>
      
      {showTooltip && limitAmount > 0 && value >= 80 && (
        <div className={cn(
          "absolute -top-8 left-1/2 transform -translate-x-1/2",
          "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
          value >= 100 
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        )}>
          {getStatusMessage()}
        </div>
      )}
    </div>
  );
});

SpendingProgress.displayName = "SpendingProgress"

export { SpendingProgress }
