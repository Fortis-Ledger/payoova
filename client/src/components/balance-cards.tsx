import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, TrendingUp } from "lucide-react";
import { SiBitcoin } from "react-icons/si";

interface Portfolio {
  totalValue?: number;
  networks?: Array<{
    network: string;
    currency: string;
    balance: string;
    usdValue: number;
  }>;
}

export default function BalanceCards() {
  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["/api/wallet/portfolio"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Wallets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 animate-pulse">
            <div className="h-20 bg-secondary/30 rounded" />
          </GlassCard>
          <GlassCard className="p-6 animate-pulse">
            <div className="h-20 bg-secondary/30 rounded" />
          </GlassCard>
        </div>
      </div>
    );
  }

  const totalBalance = portfolio?.totalValue || 0;
  const cryptoBalance = portfolio?.totalValue || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Wallets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Balance Card */}
        <GlassCard className="p-6 balance-card" glowBorder>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Total Balance</p>
              <p className="text-3xl font-bold" data-testid="text-total-balance">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center icon-3d animate-pulse-glow">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center text-accent text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5.67% this week</span>
          </div>
        </GlassCard>

        {/* Crypto Balance Card */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Crypto Assets</p>
              <p className="text-3xl font-bold" data-testid="text-crypto-balance">
                ${cryptoBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center icon-3d">
              <SiBitcoin className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="flex items-center text-primary text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.34% this month</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
