import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowBorder?: boolean;
}

export function GlassCard({ children, className, glowBorder = false }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card rounded-2xl",
        glowBorder && "glow-border",
        className
      )}
      data-testid="glass-card"
    >
      {children}
    </div>
  );
}
