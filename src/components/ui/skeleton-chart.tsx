import { Skeleton } from "./skeleton";

interface SkeletonChartProps {
  height?: string;
  className?: string;
}

export function SkeletonChart({ height = "h-64", className }: SkeletonChartProps) {
  return (
    <div className={`${height} ${className}`}>
      <Skeleton className="w-full h-full rounded-lg" />
    </div>
  );
}

interface SkeletonBarChartProps {
  bars?: number;
  height?: string;
  className?: string;
}

export function SkeletonBarChart({ 
  bars = 7, 
  height = "h-64", 
  className 
}: SkeletonBarChartProps) {
  return (
    <div className={`${height} flex items-end justify-between gap-2 p-4 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <Skeleton 
            className="w-full rounded-sm" 
            style={{ 
              height: `${Math.random() * 60 + 20}%` 
            }} 
          />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonPieChartProps {
  size?: string;
  className?: string;
}

export function SkeletonPieChart({ 
  size = "h-64 w-64", 
  className 
}: SkeletonPieChartProps) {
  return (
    <div className={`${size} ${className} flex items-center justify-center`}>
      <Skeleton className="rounded-full w-full h-full" />
    </div>
  );
}