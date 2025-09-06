import { 
  BarChart3, 
  Users, 
  Wallet, 
  ArrowLeftRight, 
  Book, 
  Key, 
  Webhook, 
  Shield, 
  Lock 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: BarChart3, active: true, count: null },
      { name: "Users", icon: Users, active: false, count: "2,847" },
      { name: "Wallets", icon: Wallet, active: false, count: null },
      { name: "Transactions", icon: ArrowLeftRight, active: false, count: null },
    ]
  },
  {
    title: "API & Development",
    items: [
      { name: "Documentation", icon: Book, active: false, count: null },
      { name: "API Keys", icon: Key, active: false, count: null },
      { name: "Webhooks", icon: Webhook, active: false, count: null },
    ]
  },
  {
    title: "Security",
    items: [
      { name: "Auth Settings", icon: Shield, active: false, count: null },
      { name: "Encryption", icon: Lock, active: false, count: null },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.title}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6 first:mt-0">
                {section.title}
              </div>
              {section.items.map((item) => (
                <a 
                  key={item.name}
                  href="#"
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    item.active 
                      ? "nav-active text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.count && (
                    <span className="ml-auto bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
