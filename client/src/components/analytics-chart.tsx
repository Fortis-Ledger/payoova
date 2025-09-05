import { GlassCard } from "@/components/ui/glass-card";

export default function AnalyticsChart() {
  const chartData = [
    { label: "Crypto Trading", value: 40, color: "var(--neon-blue)" },
    { label: "Shopping", value: 25, color: "var(--emerald-glow)" },
    { label: "Food & Dining", value: 35, color: "hsl(280, 100%, 60%)" }
  ];

  return (
    <GlassCard className="p-6 chart-container">
      <h3 className="font-bold text-lg mb-4">Spending Analytics</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">This Month</span>
          <span className="text-sm font-semibold" data-testid="text-spending-total">$3,247.89</span>
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
