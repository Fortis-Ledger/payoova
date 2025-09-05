import { ArrowLeft, Gift, Star, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function BenefitsPage() {
  return (
    <div className="min-h-screen dark p-4 pb-20 md:pb-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="icon-3d" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary icon-3d flex items-center justify-center">
              <Gift className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-lg font-semibold">Benefits</h1>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Coming Soon Banner */}
          <GlassCard className="p-6 md:p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary mx-auto mb-4 flex items-center justify-center icon-3d">
              <Star className="w-10 h-10 text-background" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Exciting Benefits Coming Soon!</h2>
            <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
              We're working on amazing rewards and benefits for Payoova users. Stay tuned for:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold">Cashback Rewards</h3>
                  <p className="text-sm text-muted-foreground">Earn up to 5% cashback on all transactions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Premium Protection</h3>
                  <p className="text-sm text-muted-foreground">Enhanced security and insurance coverage</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
                <Gift className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold">Exclusive Offers</h3>
                  <p className="text-sm text-muted-foreground">Access to special deals and promotions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-secondary/30 rounded-lg">
                <Star className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">VIP Status</h3>
                  <p className="text-sm text-muted-foreground">Priority support and exclusive features</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Notification Signup */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Get Notified</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to know when our benefits program launches. We'll send you an update as soon as it's available.
            </p>
            <div className="flex space-x-3">
              <Button className="flex-1 emerald-glow" data-testid="button-notify-me">
                Notify Me When Available
              </Button>
            </div>
          </GlassCard>

          {/* Financial Literacy Card */}
          <GlassCard className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-secondary/30 rounded-lg flex items-center justify-center">
                📚
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Financial Literacy Program</h3>
                <p className="text-muted-foreground mb-4">
                  30% off virtual & physical cards exclusively for students and faculty
                </p>
                <Button variant="outline" className="glass-card" data-testid="button-learn-more">
                  Learn more →
                </Button>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">3/4</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}