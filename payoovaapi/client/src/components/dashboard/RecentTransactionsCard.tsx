import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function RecentTransactionsCard() {
  const { toast } = useToast();
  
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  // Handle unauthorized errors
  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/auth/google";
    }, 500);
  }

  const transactions = (analytics as any)?.recentTransactions || [];

  const formatAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type: string) => {
    return type === 'receive' ? ArrowDown : ArrowUp;
  };

  const getTransactionColor = (type: string) => {
    return type === 'receive' ? 'text-green-500' : 'text-red-500';
  };

  const getAmountColor = (type: string) => {
    return type === 'receive' ? 'text-green-500' : 'text-red-500';
  };

  const formatAmount = (amount: string, currency: string, type: string) => {
    const prefix = type === 'receive' ? '+' : '-';
    return `${prefix}${amount} ${currency}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <Card data-testid="card-recent-transactions">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-recent-transactions">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-transactions">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx: any, index: number) => {
              const Icon = getTransactionIcon(tx.type);
              return (
                <div 
                  key={tx.id || index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  data-testid={`transaction-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${tx.type === 'receive' ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full flex items-center justify-center`}>
                      <Icon className={`${getTransactionColor(tx.type)} text-sm`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === 'receive' ? `Received ${tx.currency}` : `Sent ${tx.currency}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.type === 'receive' ? formatAddress(tx.fromAddress) : formatAddress(tx.toAddress)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getAmountColor(tx.type)}`}>
                      {formatAmount(tx.amount, tx.currency, tx.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(tx.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
