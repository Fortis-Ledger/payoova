import { GlassCard } from "@/components/ui/glass-card";
import { Wallet, Mail } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";

export default function AuthScreen() {
  const handleLogin = () => {
    window.location.href = "/api/login";
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

        {/* Sign Up Options */}
        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full glass-card glow-border rounded-xl p-3 md:p-4 text-left hover:bg-secondary/50 transition-all duration-300 btn-glow"
            data-testid="button-signup-email"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center icon-3d">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <span className="font-medium text-sm md:text-base">Sign up with Email</span>
            </div>
          </button>

          <button 
            onClick={handleLogin}
            className="w-full glass-card rounded-xl p-3 md:p-4 text-left hover:bg-secondary/50 transition-all duration-300"
            data-testid="button-signup-google"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center icon-3d">
                <SiGoogle className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="font-medium text-sm md:text-base">Continue with Google</span>
            </div>
          </button>

          <button 
            onClick={handleLogin}
            className="w-full glass-card rounded-xl p-3 md:p-4 text-left hover:bg-secondary/50 transition-all duration-300"
            data-testid="button-signup-apple"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center icon-3d">
                <SiApple className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="font-medium text-sm md:text-base">Continue with Apple</span>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={handleLogin}
            className="text-primary hover:text-accent transition-colors"
            data-testid="link-signin"
          >
            Already have an account? Sign in
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
