import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Wallet, TrendingUp, Code } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsGrid() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Ensure analytics has the expected structure
  const safeAnalytics = analytics || {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Users",
      value: (safeAnalytics as any)?.totalUsers?.toLocaleString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Wallets",
      value: (safeAnalytics as any)?.totalWallets?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Wallet,
      color: "green",
    },
    {
      title: "Portfolio Value",
      value: `$${((safeAnalytics as any)?.portfolioValue || 0).toLocaleString()}`,
      change: "+15.3%",
      trend: "up",
      icon: TrendingUp,
      color: "yellow",
    },
    {
      title: "Transactions",
      value: (safeAnalytics as any)?.totalTransactions?.toLocaleString() || "0",
      change: "+22.1%",
      trend: "up",
      icon: Code,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card key={metric.title} data-testid={`metric-${metric.title.toLowerCase().replace(' ', '-')}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                <p className="text-sm text-green-500 mt-1">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {metric.change} from last month
                </p>
              </div>
              <div className={`w-10 h-10 bg-${metric.color}-500/20 rounded-lg flex items-center justify-center`}>
                <metric.icon className={`text-${metric.color}-500`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
