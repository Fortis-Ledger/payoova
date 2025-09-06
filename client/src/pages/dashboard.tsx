import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BalanceCards from "@/components/balance-cards";
import CryptoAssets from "@/components/crypto-assets";
import TransactionHistory from "@/components/transaction-history";
import ActionButtons from "@/components/action-buttons";
import AnalyticsChart from "@/components/analytics-chart";
import PromoBanner from "@/components/promo-banner";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated (after loading is complete)
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000); // Increased timeout to prevent rapid redirects
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 md:pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <BalanceCards />
            <ActionButtons />
            <PromoBanner />
            <CryptoAssets />
            <TransactionHistory />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <AnalyticsChart />
          </div>
        </div>
      </div>
    </div>
  );
}
