import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import APIEndpointsCard from "@/components/dashboard/APIEndpointsCard";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import APIDocumentationSection from "@/components/dashboard/APIDocumentationSection";
import SecurityFeaturesSection from "@/components/dashboard/SecurityFeaturesSection";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/google";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Monitor your crypto wallet API performance and usage
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="secondary" 
                  className="text-sm"
                  data-testid="button-export-data"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  className="text-sm"
                  data-testid="button-generate-api-key"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <MetricsGrid />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <APIEndpointsCard />
            <RecentTransactionsCard />
          </div>

          {/* API Documentation Section */}
          <APIDocumentationSection />

          {/* Security Features Section */}
          <SecurityFeaturesSection />
        </main>
      </div>
    </div>
  );
}
