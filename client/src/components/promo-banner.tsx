import { GlassCard } from "@/components/ui/glass-card";
import { Zap } from "lucide-react";

export default function PromoBanner() {
  return (
    <GlassCard className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Pay with your credit account to enjoy 1% cashback!
          </p>
        </div>
      </div>
    </GlassCard>
  );
}