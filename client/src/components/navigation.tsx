import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Send, 
  Download, 
  CreditCard, 
  User, 
  Settings,
  BarChart3,
  Plus
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  testId: string;
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: <Home className="w-5 h-5" />,
    label: "Home",
    testId: "nav-home"
  },
  {
    href: "/cards",
    icon: <CreditCard className="w-5 h-5" />,
    label: "Card",
    testId: "nav-cards"
  },
  {
    href: "/benefits",
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Benefits",
    testId: "nav-benefits"
  },
  {
    href: "/profile",
    icon: <User className="w-5 h-5" />,
    label: "Hub",
    testId: "nav-profile"
  }
];

// Mobile Bottom Navigation
export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 md:hidden z-50 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button 
                className={cn(
                  "nav-item flex flex-col items-center p-2 transition-all duration-300 rounded-lg min-w-0 flex-1",
                  isActive && "active bg-primary/10"
                )}
                data-testid={item.testId}
              >
                <div className={cn("icon-3d mb-1", isActive && "text-primary")}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Desktop Sidebar Navigation
export function DesktopNavigation() {
  const [location] = useLocation();

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 glass-card border-r border-border/50 flex-col z-40">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent icon-3d flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-background" />
          </div>
          <h1 className="text-xl font-bold">Payoova</h1>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button 
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                    isActive 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={item.testId}
                >
                  <div className={cn("icon-3d", isActive && "text-primary")}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-border/30">
            <Link href="/send">
              <button 
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                  location === "/send"
                    ? "bg-secondary/50 text-foreground" 
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-send"
              >
                <div className="icon-3d">
                  <Send className="w-5 h-5" />
                </div>
                <span className="font-medium">Send</span>
              </button>
            </Link>
            
            <Link href="/receive">
              <button 
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                  location === "/receive"
                    ? "bg-secondary/50 text-foreground" 
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-receive"
              >
                <div className="icon-3d">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-medium">Receive</span>
              </button>
            </Link>
            
            <Link href="/settings">
              <button 
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left",
                  location === "/settings"
                    ? "bg-secondary/50 text-foreground" 
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
                data-testid="nav-settings"
              >
                <div className="icon-3d">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="font-medium">Settings</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Top Header Navigation (for authenticated users)
export function TopNavigation() {
  return (
    <nav className="glass-card border-b border-border/50 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent icon-3d flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-background" />
            </div>
            <h1 className="text-xl font-bold">Payoova</h1>
          </div>
          
          <div className="flex items-center space-x-4 ml-auto">
            <button 
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors icon-3d md:hidden" 
              data-testid="notifications-button"
            >
              <div className="w-5 h-5 text-muted-foreground hover:text-primary">🔔</div>
            </button>
            <button 
              onClick={() => window.location.href = "/api/logout"}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              data-testid="logout-button"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}