import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
};

export function StatCard({ title, value, description, icon, isLoading }: StatCardProps) {
    if(isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
