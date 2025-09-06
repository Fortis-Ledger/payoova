import { Wallet, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold">CryptoWallet API</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Button 
                variant="ghost" 
                className="px-3 py-2 text-sm font-medium bg-primary/10"
                data-testid="nav-dashboard"
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                data-testid="nav-documentation"
              >
                Documentation
              </Button>
              <Button 
                variant="ghost" 
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                data-testid="nav-analytics"
              >
                Analytics
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-testid="status-indicator"></div>
              <span className="text-sm text-muted-foreground">API Online</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                  data-testid="button-user-menu"
                >
                  <User className="text-sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="menu-profile">Profile</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-settings">Settings</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="menu-logout"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
