import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SiBitcoin, SiEthereum } from "react-icons/si";

const AssetIcon = ({ symbol }: { symbol: string }) => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return <SiBitcoin className="w-6 h-6 text-orange-500" />;
    case 'eth':
      return <SiEthereum className="w-6 h-6 text-blue-500" />;
    default:
      return <div className="w-6 h-6 bg-purple-500 rounded-full" />;
  }
};

export default function CryptoAssets() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["/api/crypto-assets"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Assets</h2>
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
        <h2 className="text-2xl font-bold">Your Assets</h2>
        <button className="text-primary hover:text-accent transition-colors" data-testid="link-view-all-assets">
          View All
        </button>
      </div>

      <GlassCard className="p-6">
        <div className="space-y-4">
          {!assets || assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No crypto assets found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start by purchasing your first cryptocurrency.
              </p>
            </div>
          ) : (
            assets.map((asset: any) => (
              <div 
                key={asset.id}
                className="crypto-item flex items-center justify-between p-4 rounded-xl transition-all duration-300"
                data-testid={`card-asset-${asset.symbol}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center icon-3d">
                    <AssetIcon symbol={asset.symbol} />
                  </div>
                  <div>
                    <p className="font-semibold" data-testid={`text-asset-name-${asset.symbol}`}>
                      {asset.name}
                    </p>
                    <p className="text-muted-foreground text-sm" data-testid={`text-asset-symbol-${asset.symbol}`}>
                      {asset.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold" data-testid={`text-asset-balance-${asset.symbol}`}>
                    {parseFloat(asset.balance).toFixed(6)} {asset.symbol}
                  </p>
                  <p className="text-muted-foreground text-sm" data-testid={`text-asset-value-${asset.symbol}`}>
                    ${parseFloat(asset.usdValue).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center text-sm ${
                    parseFloat(asset.priceChange24h) >= 0 ? 'text-accent' : 'text-red-400'
                  }`}>
                    {parseFloat(asset.priceChange24h) >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span data-testid={`text-asset-change-${asset.symbol}`}>
                      {parseFloat(asset.priceChange24h).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-16 h-8 mt-1">
                    <svg className="w-full h-full" viewBox="0 0 50 20">
                      <polyline 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1" 
                        points={parseFloat(asset.priceChange24h) >= 0 
                          ? "0,15 10,12 20,8 30,10 40,6 50,4"
                          : "0,8 10,10 20,12 30,14 40,16 50,18"
                        } 
                        className={parseFloat(asset.priceChange24h) >= 0 ? 'text-accent' : 'text-red-400'}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
