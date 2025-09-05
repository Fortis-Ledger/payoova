import { Plus, Send, DollarSign, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";

export default function ActionButtons() {
  return (
    <GlassCard className="p-4 md:p-6">
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {/* Deposit */}
        <Link href="/receive">
          <button className="flex flex-col items-center space-y-2 md:space-y-3 group" data-testid="action-deposit">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center icon-3d group-hover:bg-white/20 transition-all duration-300">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground">Deposit</span>
          </button>
        </Link>

        {/* Send */}
        <Link href="/send">
          <button className="flex flex-col items-center space-y-2 md:space-y-3 group" data-testid="action-send">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center icon-3d group-hover:bg-white/20 transition-all duration-300">
              <Send className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground">Send</span>
          </button>
        </Link>

        {/* Earn */}
        <Link href="/benefits">
          <button className="flex flex-col items-center space-y-2 md:space-y-3 group relative" data-testid="action-earn">
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center icon-3d group-hover:bg-white/20 transition-all duration-300">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              {/* New Badge */}
              <div className="absolute -top-1 -right-1 w-6 h-4 md:w-7 md:h-5 new-badge rounded-full flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-bold text-white">New</span>
              </div>
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground">Earn</span>
          </button>
        </Link>

        {/* More */}
        <Link href="/settings">
          <button className="flex flex-col items-center space-y-2 md:space-y-3 group" data-testid="action-more">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center icon-3d group-hover:bg-white/20 transition-all duration-300">
              <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            </div>
            <span className="text-xs md:text-sm font-medium text-foreground">More</span>
          </button>
        </Link>
      </div>
    </GlassCard>
  );
}