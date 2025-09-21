import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonStatCard, SkeletonChart, SkeletonCard } from "@/components/ui/skeleton-components";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Net Worth Card Skeleton */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="text-center">
              <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto mb-2" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-12 bg-muted animate-pulse rounded mx-auto mb-1" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        <div className="hidden md:flex gap-2">
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      {/* Quick Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SkeletonChart height="h-64" className="rounded-lg" />
          <SkeletonCard showHeader showDescription contentLines={5} />
        </div>
        <div className="lg:col-span-1">
          <SkeletonChart height="h-40" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AccountsSkeleton() {
  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded hidden md:block" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded hidden md:block" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                  <div>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded mb-1" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
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
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="h-9 w-20 bg-muted animate-pulse rounded" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-background animate-pulse rounded" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="border rounded-lg">
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