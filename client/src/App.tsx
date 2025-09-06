import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavigation, DesktopNavigation, TopNavigation } from "@/components/navigation";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SendPage from "@/pages/send";
import ReceivePage from "@/pages/receive";
import CardsPage from "@/pages/cards";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import BenefitsPage from "@/pages/benefits";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, firebaseUser, error } = useAuth();

  // Show loading state only during initial authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to Payoova...</p>
        </div>
      </div>
    );
  }

  // Show error state if API fails but user is authenticated with Firebase
  if (firebaseUser && error) {
    console.warn("API connection failed, but Firebase user exists. Showing dashboard anyway.");
  }

  return (
    <div className="min-h-screen dark">
      {isAuthenticated && (
        <>
          <DesktopNavigation />
          <TopNavigation />
        </>
      )}

      <div className={isAuthenticated ? "md:ml-64 pb-20 md:pb-0" : ""}>
        <Switch>
          {!isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/send" component={SendPage} />
              <Route path="/receive" component={ReceivePage} />
              <Route path="/cards" component={CardsPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/benefits" component={BenefitsPage} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>

      {isAuthenticated && <MobileNavigation />}
    </div>
  );
}

function App() {
  // Clear any old tokens on app start
  useEffect(() => {
    const oldToken = localStorage.getItem("auth0_token");
    if (oldToken === "demo-token-123") {
      localStorage.removeItem("auth0_token");
    }
    // Also clear any invalid Firebase tokens
    const firebaseToken = localStorage.getItem("firebase_token");
    if (!firebaseToken || firebaseToken.length < 10) {
      localStorage.removeItem("firebase_token");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
