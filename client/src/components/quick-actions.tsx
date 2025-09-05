import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CreditCard, Plus, Send } from "lucide-react";

export default function QuickActions() {
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linkCardMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/linked-cards", {
        cardType: "visa",
        lastFourDigits: "1234"
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Card linked successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/linked-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      setIsLinking(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to link card. Please try again.",
        variant: "destructive",
      });
      setIsLinking(false);
    },
  });

  const handleLinkCard = () => {
    setIsLinking(true);
    linkCardMutation.mutate();
  };

  return (
    <GlassCard className="p-6">
      <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={handleLinkCard}
          disabled={isLinking}
          className="w-full glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-all duration-300 btn-glow emerald-glow disabled:opacity-50"
          data-testid="button-link-card"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center icon-3d">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold">
                {isLinking ? "Linking..." : "Link Card"}
              </p>
              <p className="text-muted-foreground text-sm">Visa/Mastercard</p>
            </div>
          </div>
        </button>

        <button className="w-full glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-all duration-300" data-testid="button-buy-crypto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center icon-3d">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Buy Crypto</p>
              <p className="text-muted-foreground text-sm">Add funds</p>
            </div>
          </div>
        </button>

        <button className="w-full glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-all duration-300" data-testid="button-send-money">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center icon-3d">
              <Send className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold">Send Money</p>
              <p className="text-muted-foreground text-sm">Transfer funds</p>
            </div>
          </div>
        </button>
      </div>
    </GlassCard>
  );
}
