import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowDown, ArrowUp, CreditCard } from "lucide-react";

const TransactionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'receive':
      return <ArrowDown className="w-6 h-6 text-accent" />;
    case 'send':
      return <ArrowUp className="w-6 h-6 text-red-500" />;
    case 'purchase':
      return <CreditCard className="w-6 h-6 text-blue-500" />;
    default:
      return <ArrowDown className="w-6 h-6 text-accent" />;
  }
};

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
        </div>
        <GlassCard className="p-6 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary/30 rounded" />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Transactions</h2>
        <button className="text-primary hover:text-accent transition-colors" data-testid="link-view-all-transactions">
          View All
        </button>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-4">
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your transaction history will appear here.
              </p>
            </div>
          ) : (
            transactions.map((transaction: any) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/30 transition-all duration-300"
                data-testid={`row-transaction-${transaction.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center icon-3d">
                    <TransactionIcon type={transaction.type} />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description || `${transaction.type} ${transaction.asset}`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {transaction.toAddress && `To: ${transaction.toAddress.slice(0, 12)}...`}
                      {transaction.fromAddress && `From: ${transaction.fromAddress.slice(0, 12)}...`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'receive' ? 'text-accent' : 'text-red-400'
                  }`} data-testid={`text-transaction-amount-${transaction.id}`}>
                    {transaction.type === 'receive' ? '+' : '-'}
                    {parseFloat(transaction.amount).toFixed(6)} {transaction.asset}
                  </p>
                  <p className="text-muted-foreground text-sm" data-testid={`text-transaction-date-${transaction.id}`}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
