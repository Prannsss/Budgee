import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

interface SkeletonCardProps {
  showHeader?: boolean;
  showDescription?: boolean;
  contentLines?: number;
  className?: string;
}

export function SkeletonCard({ 
  showHeader = true, 
  showDescription = false, 
  contentLines = 3,
  className 
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          {showDescription && <Skeleton className="h-4 w-1/2 mt-2" />}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === contentLines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface SkeletonStatCardProps {
  className?: string;
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface SkeletonAccountCardProps {
  className?: string;
}

export function SkeletonAccountCard({ className }: SkeletonAccountCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}