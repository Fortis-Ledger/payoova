import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Send, Wallet } from "lucide-react";
import { Link } from "wouter";

export default function SendPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/transactions", {
        type: "send",
        asset: currency,
        amount: parseFloat(amount),
        usdValue: parseFloat(amount) * (currency === "ETH" ? 2400 : currency === "BTC" ? 45000 : 1),
        toAddress: recipient,
        description: description || `Sent ${amount} ${currency}`,
        status: "pending"
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction Sent",
        description: `Successfully sent ${amount} ${currency}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      setRecipient("");
      setAmount("");
      setDescription("");
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
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!recipient || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    sendMutation.mutate();
  };

  return (
    <div className="min-h-screen dark p-4">
      <div className="max-w-md mx-auto md:max-w-2xl">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="icon-3d" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent icon-3d flex items-center justify-center">
              <Send className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold">Send Money</h1>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Send Form */}
          <GlassCard className="p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x742d35Cc6634C0532925a3b8D398aFae...or username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 glass-card"
                  data-testid="input-recipient"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 glass-card"
                    data-testid="input-amount"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1 glass-card" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="BNB">BNB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  placeholder="Payment for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 glass-card"
                  data-testid="input-description"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="w-full btn-glow mt-6"
                data-testid="button-send-transaction"
              >
                {sendMutation.isPending ? "Sending..." : "Send Transaction"}
              </Button>
            </div>
          </GlassCard>

          {/* Quick Send */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Recent Recipients</h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent recipients</p>
                <p className="text-sm">Your recent sends will appear here</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}