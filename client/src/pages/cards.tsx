import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, CreditCard, Plus, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

interface VirtualCard {
  id: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  nickname: string;
  balance: string;
  spendingLimit: string;
  status: string;
}

interface PhysicalCardApplication {
  id: string;
  cardType: string;
  shippingAddress: string;
  status: string;
  applicationFee: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function CardsPage() {
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [newCardNickname, setNewCardNickname] = useState("");
  const [physicalCardAddress, setPhysicalCardAddress] = useState("");
  const [selectedCardType, setSelectedCardType] = useState("premium");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: virtualCards = [], isLoading: loadingVirtualCards } = useQuery<VirtualCard[]>({
    queryKey: ["/api/virtual-cards"],
  });

  const { data: physicalCardApplications = [], isLoading: loadingPhysicalCards } = useQuery<PhysicalCardApplication[]>({
    queryKey: ["/api/physical-card-applications"],
  });

  const createVirtualCardMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/virtual-cards", {
        cardNumber: `4***-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryMonth: "12",
        expiryYear: "2028",
        cvv: "***",
        cardholderName: "PAYOOVA USER",
        nickname: newCardNickname || "Virtual Card",
        balance: "0",
        spendingLimit: "1000",
        status: "active"
      });
    },
    onSuccess: () => {
      toast({
        title: "Virtual Card Created",
        description: "Your new virtual card is ready to use!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-cards"] });
      setNewCardNickname("");
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
        description: "Failed to create virtual card.",
        variant: "destructive",
      });
    },
  });

  const applyPhysicalCardMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/physical-card-applications", {
        cardType: "premium",
        shippingAddress: physicalCardAddress,
        applicationFee: "25.00"
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your physical card application is being reviewed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/physical-card-applications"] });
      setPhysicalCardAddress("");
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
        description: "Failed to submit application.",
        variant: "destructive",
      });
    },
  });

  const handleCreateVirtualCard = () => {
    createVirtualCardMutation.mutate();
  };

  const handleApplyPhysicalCard = () => {
    if (!physicalCardAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter your shipping address.",
        variant: "destructive",
      });
      return;
    }
    applyPhysicalCardMutation.mutate();
  };

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(showCardDetails === cardId ? null : cardId);
  };

  return (
    <div className="min-h-screen dark p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="icon-3d" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 icon-3d flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Cards</h1>
          </div>
        </div>

        <Tabs defaultValue="virtual" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="virtual" data-testid="tab-virtual" className="text-xs md:text-sm">Virtual Cards</TabsTrigger>
            <TabsTrigger value="physical" data-testid="tab-physical" className="text-xs md:text-sm">Physical Cards</TabsTrigger>
          </TabsList>

          <TabsContent value="virtual" className="space-y-4 md:space-y-6">
            {/* Create Virtual Card */}
            <GlassCard className="p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Create Virtual Card</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nickname" className="text-sm font-medium">
                    Card Nickname (Optional)
                  </Label>
                  <Input
                    id="nickname"
                    placeholder="Shopping Card, Travel Card..."
                    value={newCardNickname}
                    onChange={(e) => setNewCardNickname(e.target.value)}
                    className="mt-1 glass-card"
                    data-testid="input-card-nickname"
                  />
                </div>
                <Button
                  onClick={handleCreateVirtualCard}
                  disabled={createVirtualCardMutation.isPending}
                  className="w-full btn-glow"
                  data-testid="button-create-virtual-card"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createVirtualCardMutation.isPending ? "Creating..." : "Create Virtual Card"}
                </Button>
              </div>
            </GlassCard>

            {/* Virtual Cards List */}
            <div className="space-y-4">
              {virtualCards.length === 0 ? (
                <GlassCard className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No virtual cards yet</p>
                    <p className="text-sm">Create your first virtual card above</p>
                  </div>
                </GlassCard>
              ) : (
                virtualCards.map((card: VirtualCard) => (
                  <GlassCard key={card.id} className="p-6">
                    <div className="space-y-4">
                      {/* Card Visual */}
                      <div className="relative h-48 rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-white">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <p className="text-sm opacity-90">Virtual Card</p>
                            <p className="text-lg font-bold">{card.nickname}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-90">Balance</p>
                            <p className="text-lg font-bold">${parseFloat(card.balance).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-lg font-mono tracking-wider">
                            {showCardDetails === card.id 
                              ? `${card.cardNumber}` 
                              : `4***-****-****-${card.cardNumber.slice(-4)}`
                            }
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs opacity-90">Valid Thru</p>
                              <p className="text-sm font-mono">
                                {showCardDetails === card.id 
                                  ? `${card.expiryMonth}/${card.expiryYear}`
                                  : "**/**"
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs opacity-90">CVV</p>
                              <p className="text-sm font-mono">
                                {showCardDetails === card.id ? card.cvv : "***"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-4 right-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCardDetails(card.id)}
                            className="text-white hover:bg-white/20"
                            data-testid={`button-toggle-details-${card.id}`}
                          >
                            {showCardDetails === card.id ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="glass-card" data-testid={`button-freeze-${card.id}`}>
                          Freeze
                        </Button>
                        <Button variant="outline" className="glass-card" data-testid={`button-settings-${card.id}`}>
                          Settings
                        </Button>
                        <Button variant="outline" className="glass-card" data-testid={`button-transactions-${card.id}`}>
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          Transactions
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="physical" className="space-y-4 md:space-y-6">
            {/* Apply for Physical Card */}
            <GlassCard className="p-4 md:p-6">
              <h3 className="font-bold text-lg mb-4">Apply for Physical Card</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSelectedCardType("standard")}
                    className={`text-center p-3 rounded-lg transition-all duration-200 ${
                      selectedCardType === "standard" 
                        ? "bg-primary/20 border-2 border-primary" 
                        : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <div className="w-12 h-8 mx-auto mb-2 bg-gray-600 rounded"></div>
                    <p className="text-xs font-medium">Standard</p>
                    <p className="text-xs text-muted-foreground">Free</p>
                  </button>
                  <button 
                    onClick={() => setSelectedCardType("premium")}
                    className={`text-center p-3 rounded-lg transition-all duration-200 ${
                      selectedCardType === "premium" 
                        ? "bg-primary/20 border-2 border-primary" 
                        : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <div className="w-12 h-8 mx-auto mb-2 bg-gradient-to-br from-primary to-accent rounded"></div>
                    <p className="text-xs font-medium">Premium</p>
                    <p className="text-xs text-muted-foreground">$25</p>
                  </button>
                  <button 
                    onClick={() => setSelectedCardType("metal")}
                    className={`text-center p-3 rounded-lg transition-all duration-200 ${
                      selectedCardType === "metal" 
                        ? "bg-primary/20 border-2 border-primary" 
                        : "bg-secondary/30 border-2 border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <div className="w-12 h-8 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded"></div>
                    <p className="text-xs font-medium">Metal</p>
                    <p className="text-xs text-muted-foreground">$99</p>
                  </button>
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Shipping Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City, State, ZIP"
                    value={physicalCardAddress}
                    onChange={(e) => setPhysicalCardAddress(e.target.value)}
                    className="mt-1 glass-card"
                    data-testid="input-shipping-address"
                  />
                </div>
                
                <Button
                  onClick={handleApplyPhysicalCard}
                  disabled={applyPhysicalCardMutation.isPending}
                  className="w-full emerald-glow"
                  data-testid="button-apply-physical-card"
                >
                  {applyPhysicalCardMutation.isPending ? "Submitting..." : 
                   `Apply for ${selectedCardType.charAt(0).toUpperCase() + selectedCardType.slice(1)} Card - ${
                     selectedCardType === "standard" ? "Free" : 
                     selectedCardType === "premium" ? "$25" : "$99"
                   }`
                  }
                </Button>
              </div>
            </GlassCard>

            {/* Physical Card Applications */}
            <div className="space-y-4">
              {physicalCardApplications.length === 0 ? (
                <GlassCard className="p-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No physical card applications</p>
                    <p className="text-sm">Apply for your first physical card above</p>
                  </div>
                </GlassCard>
              ) : (
                physicalCardApplications.map((application: PhysicalCardApplication) => (
                  <GlassCard key={application.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {application.cardType.charAt(0).toUpperCase() + application.cardType.slice(1)} Card
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          application.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          application.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                          application.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {application.trackingNumber && (
                      <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium">Tracking Number</p>
                        <p className="text-sm font-mono text-muted-foreground">{application.trackingNumber}</p>
                      </div>
                    )}
                  </GlassCard>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}