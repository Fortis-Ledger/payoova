import { GlassCard } from "@/components/ui/glass-card";
import { useQuery } from "@tanstack/react-query";

interface TransactionStats {
  summary: {
    totalValue: number;
    byType: Record<string, { value: number }>;
  };
}

export default function AnalyticsChart() {
  const { data: stats, isLoading } = useQuery<TransactionStats>({
    queryKey: ["/api/transactions/stats"],
  });

  // Calculate spending categories from transaction data
  const calculateChartData = () => {
    if (!stats?.summary) {
      return [
        { label: "No Data", value: 100, color: "var(--muted)" }
      ];
    }

    const { byType, totalValue } = stats.summary;

    // Map transaction types to spending categories
    const categoryMap: Record<string, string> = {
      send: "Crypto Trading",
      purchase: "Shopping",
      transfer: "Transfers",
      // Add more mappings as needed
    };

    const categories = Object.entries(byType).map(([type, data]) => ({
      label: categoryMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
      value: totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0,
      color: getCategoryColor(type),
    }));

    // If no categories, show placeholder
    if (categories.length === 0) {
      return [
        { label: "No Transactions", value: 100, color: "var(--muted)" }
      ];
    }

    return categories;
  };

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      send: "var(--neon-blue)",
      purchase: "var(--emerald-glow)",
      transfer: "hsl(280, 100%, 60%)",
      default: "var(--primary)",
    };
    return colors[type] || colors.default;
  };

  const chartData = calculateChartData();
  const totalSpending = stats?.summary?.totalValue || 0;

  if (isLoading) {
    return (
      <GlassCard className="p-6 chart-container">
        <h3 className="font-bold text-lg mb-4">Spending Analytics</h3>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-secondary/30 rounded"></div>
          <div className="h-32 bg-secondary/30 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-secondary/30 rounded"></div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 chart-container">
      <h3 className="font-bold text-lg mb-4">Spending Analytics</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">This Month</span>
          <span className="text-sm font-semibold" data-testid="text-spending-total">
            ${totalSpending.toFixed(2)}
          </span>
        </div>
        
        {/* Simple Pie Chart Representation */}
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="hsl(240, 4%, 20%)" strokeWidth="3"/>
            {chartData.map((item, index) => {
              const offset = chartData.slice(0, index).reduce((sum, prev) => sum + prev.value, 0);
              return (
                <circle 
                  key={item.label}
                  cx="20" 
                  cy="20" 
                  r="15.915" 
                  fill="transparent" 
                  stroke={item.color} 
                  strokeWidth="3"
                  strokeDasharray={`${item.value} 100`} 
                  strokeDashoffset={`-${offset}`} 
                  className="animate-pulse"
                />
              );
            })}
          </svg>
        </div>

        <div className="space-y-2 text-sm">
          {chartData.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                  data-testid={`indicator-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <span>{item.label}</span>
              </div>
              <span data-testid={`text-percentage-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
