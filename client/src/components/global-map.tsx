import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";

export default function GlobalMap() {
  const [liveCount, setLiveCount] = useState(1247);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => prev + Math.floor(Math.random() * 10));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="p-6 map-container">
      <h3 className="font-bold text-lg mb-4">Live Payments</h3>
      <div className="relative w-full h-48 bg-gradient-to-br from-background to-secondary/50 rounded-xl overflow-hidden">
        {/* Simplified world map representation */}
        <div className="absolute inset-0 opacity-20">
          {/* Continent outlines with CSS */}
          <div className="absolute top-8 left-8 w-16 h-12 border border-muted-foreground/30 rounded-tl-xl rounded-br-lg" />
          <div className="absolute top-12 left-20 w-20 h-16 border border-muted-foreground/30 rounded-lg" />
          <div className="absolute top-16 right-12 w-12 h-20 border border-muted-foreground/30 rounded-tr-xl" />
        </div>
        
        {/* Animated payment dots */}
        <div className="absolute top-6 left-12 w-2 h-2 bg-primary rounded-full pulse-dot" />
        <div 
          className="absolute top-16 left-28 w-2 h-2 bg-accent rounded-full pulse-dot" 
          style={{ animationDelay: '0.5s' }}
        />
        <div 
          className="absolute top-24 right-16 w-2 h-2 bg-primary rounded-full pulse-dot" 
          style={{ animationDelay: '1s' }}
        />
        <div 
          className="absolute top-32 left-16 w-2 h-2 bg-accent rounded-full pulse-dot" 
          style={{ animationDelay: '1.5s' }}
        />
        <div 
          className="absolute top-20 right-24 w-2 h-2 bg-purple-500 rounded-full pulse-dot" 
          style={{ animationDelay: '2s' }}
        />
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="text-accent font-semibold" data-testid="text-live-payments-count">
            {liveCount.toLocaleString()}
          </span> transactions in the last hour
        </p>
      </div>
    </GlassCard>
  );
}
