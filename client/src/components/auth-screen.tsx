import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, Eye, EyeOff } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    login({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail("demo@payoova.com");
    setPassword("demo123");
    login({ email: "demo@payoova.com", password: "demo123" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark">
      <GlassCard className="p-6 md:p-8 w-full max-w-md mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 icon-3d">
            <Wallet className="w-7 h-7 md:w-8 md:h-8 text-background" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Payoova
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">Unlock Your Digital Future</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 glass-card"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-card pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full glass-card glow-border btn-glow"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Demo Login */}
        <div className="text-center">
          <Button
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full glass-card"
            disabled={isLoggingIn}
          >
            Demo Login
          </Button>
        </div>

        {/* Social Login Options */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleDemoLogin}
              className="w-full glass-card rounded-xl p-3 text-left hover:bg-secondary/50 transition-all duration-300"
              disabled={isLoggingIn}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center icon-3d">
                  <SiGoogle className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-xs">Google</span>
              </div>
            </button>

            <button 
              onClick={handleDemoLogin}
              className="w-full glass-card rounded-xl p-3 text-left hover:bg-secondary/50 transition-all duration-300"
              disabled={isLoggingIn}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center icon-3d">
                  <SiApple className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-xs">Apple</span>
              </div>
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
