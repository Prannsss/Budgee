import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, LineChart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-lg bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground">
              <Eye className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm text-primary-foreground/80">Net Worth</p>
              <p className="text-3xl font-bold tracking-tight">$58,370.50</p>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground">
              <LineChart className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center text-sm mt-6">
            <div>
              <p className="text-primary-foreground/80">Assets</p>
              <p className="font-semibold">$63,641.50</p>
            </div>
            <div>
              <p className="text-primary-foreground/80">Liabilities</p>
              <p className="font-semibold">$5,271.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <OverviewChart />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
