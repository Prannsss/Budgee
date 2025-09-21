import { Skeleton } from "./skeleton";

interface AppLoadingProps {
  message?: string;
  className?: string;
}

export function AppLoading({ message = "Loading...", className }: AppLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-muted-foreground font-medium">{message}</span>
      </div>
      
      {/* Optional skeleton preview */}
      <div className="w-full max-w-md space-y-3 mt-8">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

export function PageLoading({ 
  title = "Loading page...", 
  description = "Please wait while we load your content",
  className 
}: PageLoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 space-y-4 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

interface ComponentLoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ComponentLoading({ size = "md", className }: ComponentLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
    </div>
  );
}