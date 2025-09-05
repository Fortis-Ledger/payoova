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
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen dark">
      {isAuthenticated && !isLoading && (
        <>
          <DesktopNavigation />
          <TopNavigation />
        </>
      )}
      
      <div className={isAuthenticated && !isLoading ? "md:ml-64 pb-20 md:pb-0" : ""}>
        <Switch>
          {isLoading || !isAuthenticated ? (
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

      {isAuthenticated && !isLoading && <MobileNavigation />}
    </div>
  );
}

function App() {
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
