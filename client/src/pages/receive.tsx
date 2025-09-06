import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Copy, QrCode, Download } from "lucide-react";
import { Link } from "wouter";
import { SiBitcoin, SiEthereum } from "react-icons/si";

export default function ReceivePage() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

interface WalletInfo {
  walletAddress?: string;
  networks?: Array<{
    network: string;
    address: string;
  }>;
}

  const { data: walletInfo } = useQuery<WalletInfo>({
    queryKey: ["/api/wallet/info"],
  });

  const createPaymentRequestMutation = useMutation({
    mutationFn: async () => {
      // Note: Payment requests are demo feature - would need separate API
      toast({
        title: "Demo Feature",
        description: "Payment requests are demo features. Real implementation would create payment links.",
      });
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Payment Request Created",
        description: "Payment link has been generated successfully",
      });
      // No need to invalidate as this is demo feature
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create payment request.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRequest = () => {
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter an amount.",
        variant: "destructive",
      });
      return;
    }
    createPaymentRequestMutation.mutate();
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const generateQRCode = (address: string) => {
    // QR code generation would be implemented here
    toast({
      title: "QR Code",
      description: "QR code feature coming soon!",
    });
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary icon-3d flex items-center justify-center">
              <Download className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold">Receive Money</h1>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Payment Request */}
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-bold text-lg mb-4">Create Payment Request</h3>
            <div className="space-y-4">
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
                    data-testid="input-request-amount"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1 glass-card" data-testid="select-request-currency">
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
                  data-testid="input-request-description"
                />
              </div>

              <Button
                onClick={handleCreateRequest}
                disabled={createPaymentRequestMutation.isPending}
                className="w-full emerald-glow mt-4"
                data-testid="button-create-request"
              >
                {createPaymentRequestMutation.isPending ? "Creating..." : "Create Payment Link"}
              </Button>
            </div>
          </GlassCard>

          {/* Wallet Addresses */}
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-semibold text-base mb-3">Quick Receive</h3>
            <div className="space-y-2">
              {/* Compact wallet addresses */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <SiEthereum className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">ETH</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    0x742d...4d4e
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress("0x742d35Cc6634C0532925a3b8D398aFae4d4e")}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateQRCode("0x742d35Cc6634C0532925a3b8D398aFae4d4e")}
                    className="h-7 w-7 p-0"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <SiBitcoin className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">BTC</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    bc1q...0wlh
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateQRCode("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh")}
                    className="h-7 w-7 p-0"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">BNB</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    0x742d...4d4e
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress("0x742d35Cc6634C0532925a3b8D398aFae4d4e")}
                    className="h-7 w-7 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateQRCode("0x742d35Cc6634C0532925a3b8D398aFae4d4e")}
                    className="h-7 w-7 p-0"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}