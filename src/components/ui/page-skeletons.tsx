import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonStatCard, SkeletonChart, SkeletonCard } from "@/components/ui/skeleton-components";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-0">
      {/* Net Worth Card Skeleton - Mobile optimized */}
      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0">
            {/* Mobile: Center aligned, Desktop: Distributed */}
            <div className="md:hidden text-center">
              <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
            </div>
            
            {/* Desktop layout */}
            <div className="hidden md:flex md:items-center md:justify-between md:w-full">
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              <div className="text-center">
                <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
                <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
              </div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
          
          {/* Mobile: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center text-sm mt-4 md:mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={i === 2 ? "hidden md:block" : ""}>
                <div className="h-3 w-12 bg-muted animate-pulse rounded mx-auto mb-1" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 md:h-6 md:w-24 bg-muted animate-pulse rounded" />
        <div className="hidden md:flex gap-2">
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      {/* Quick Stats Cards Skeleton - Mobile stacked, Desktop side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Main Content Grid Skeleton - Mobile stacked, Desktop side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
          {/* Chart skeleton - smaller on mobile */}
          <SkeletonChart height="h-48 md:h-64" className="rounded-lg" />
          {/* Recent transactions - fewer lines on mobile */}
          <SkeletonCard showHeader showDescription contentLines={3} className="md:hidden" />
          <SkeletonCard showHeader showDescription contentLines={5} className="hidden md:block" />
        </div>
        <div className="lg:col-span-1">
          <SkeletonChart height="h-32 md:h-40" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AccountsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="h-6 md:h-8 w-24 md:w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-48 md:w-64 bg-muted animate-pulse rounded hidden md:block" />
        </div>
        <div className="h-9 md:h-10 w-24 md:w-32 bg-muted animate-pulse rounded hidden md:block" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 bg-muted animate-pulse rounded-full" />
                  <div>
                    <div className="h-4 md:h-5 w-20 md:w-24 bg-muted animate-pulse rounded mb-1" />
                    <div className="h-3 w-14 md:w-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-6 w-6 md:h-8 md:w-8 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 md:h-4 w-16 md:w-20 bg-muted animate-pulse rounded" />
                <div className="h-5 md:h-6 w-24 md:w-32 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 md:h-8 w-32 md:w-40 bg-muted animate-pulse rounded" />
        <div className="h-8 md:h-9 w-16 md:w-20 bg-muted animate-pulse rounded" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 md:h-8 w-12 md:w-16 bg-background animate-pulse rounded" />
          ))}
        </div>

        {/* Mobile: Card Layout Skeleton */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto mb-1" />
                    <div className="h-3 w-12 bg-muted animate-pulse rounded ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop: Table Skeleton */}
        <div className="hidden md:block border rounded-lg">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}