import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { SiGoogle, SiApple } from "react-icons/si";
import { useAuth } from "@/hooks/useAuth";

export default function AuthScreen() {
  const { login, isLoggingIn, isAuthReady, firebaseUser } = useAuth();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authReadyChecked, setAuthReadyChecked] = useState(false);
  
  // Check if auth is ready and show a message if it takes too long
  useEffect(() => {
    if (isAuthReady) {
      setAuthReadyChecked(true);
      return;
    }
    
    // Set a timeout to show a message if auth initialization takes too long
    const timeoutId = setTimeout(() => {
      if (!isAuthReady && !authReadyChecked) {
        setAuthError("Authentication service is taking longer than expected to initialize. Please wait a moment or refresh the page.");
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthReady, authReadyChecked]);
  
  // Log if user is already logged in
  useEffect(() => {
    if (firebaseUser) {
      console.log("User already logged in");
      // We can't navigate programmatically without react-router-dom
      // Instead, we'll show a message to the user
      setAuthError("You are already logged in!");
    }
  }, [firebaseUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Firebase handles authentication, no need for email/password validation
    login();
  };

  // Use a single login handler for all methods to prevent multiple login attempts
  const handleSocialLogin = () => {
    // Firebase handles authentication
    console.log("Social login button clicked", new Date().toISOString());
    console.log("isLoggingIn state:", isLoggingIn);
    console.log("localLoading state:", localLoading);
    console.log("isAuthReady state:", isAuthReady);
    
    // Clear any previous errors
    setAuthError(null);
    
    try {
      // Check if auth is ready first
      if (!isAuthReady) {
        console.error("Firebase auth is not ready yet");
        setAuthError("Authentication service is not ready. Please try again in a moment.");
        return;
      }
      
      if (!isLoggingIn && !localLoading) {
        console.log("Attempting to login...");
        
        // Set local loading state immediately for UI feedback
        setLocalLoading(true);
        
        // Add a small delay to ensure Firebase is fully initialized
        setTimeout(() => {
          try {
            console.log("Executing login after delay");
            login();
            console.log("Login function called successfully");
            
            // Set a timeout to reset local loading state if login doesn't complete
            setTimeout(() => {
              if (localLoading) {
                console.log("Login taking too long, resetting local loading state");
                setLocalLoading(false);
                setAuthError("Login attempt timed out. Please try again.");
              }
            }, 10000); // 10 seconds timeout
          } catch (delayedError) {
            console.error("Error in delayed login:", delayedError);
            setLocalLoading(false);
            setAuthError("There was an error during login. Please try again.");
          }
        }, 500);
      } else {
        console.log("Login already in progress, ignoring click");
      }
    } catch (error) {
      console.error("Error in handleSocialLogin:", error);
      setLocalLoading(false);
      setAuthError("There was an error initiating login. Please try again.");
    }
  };
  
  // Toggle login options visibility
  const toggleLoginOptions = () => {
    setShowLoginOptions(!showLoginOptions);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark">
      <GlassCard className="p-6 md:p-8 w-full max-w-md mx-auto space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4 icon-3d">
            <Wallet className="w-7 h-7 md:w-8 md:h-8 text-background" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Payoova
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Unlock Your Digital Future
          </p>
        </div>

        {/* Firebase Authentication Button */}
        <div className="space-y-4">
          <Button
            onClick={handleSocialLogin}
            className="w-full glass-card glow-border btn-glow relative"
            disabled={isLoggingIn || localLoading}
          >
            {isLoggingIn || localLoading ? (
              <>
                <span className="animate-pulse">Connecting</span>
                <span className="animate-bounce inline-block ml-1">.</span>
                <span className="animate-bounce inline-block ml-0.5 animation-delay-200">.</span>
                <span className="animate-bounce inline-block ml-0.5 animation-delay-400">.</span>
              </>
            ) : (
              "Sign In with Google"
            )}
          </Button>
          
          {authError && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {authError}
              </p>
              <div className="mt-2 flex justify-between">
                <button 
                  onClick={() => setAuthError(null)} 
                  className="text-xs text-red-300 hover:text-white underline"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    setAuthError(null);
                    setLocalLoading(false);
                    // Wait a moment before retrying
                    setTimeout(() => handleSocialLogin(), 500);
                  }} 
                  className="text-xs text-green-300 hover:text-white underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Retry Sign In
                </button>
              </div>
            </div>
          )}
          
          {/* Popup blocker warning */}
          <p className="text-xs text-muted-foreground text-center">
            Please ensure popup blockers are disabled for this site.
            <button 
              onClick={toggleLoginOptions} 
              className="ml-1 text-blue-400 hover:underline"
            >
              Having issues?
            </button>
          </p>
          
          {/* Login options panel */}
          {showLoginOptions && (
            <div className="mt-2 p-3 bg-gray-800 rounded-md text-xs">
              <p className="mb-2">If you're experiencing popup blocking issues:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Check your browser settings to allow popups for this site</li>
                <li>Try using a different browser</li>
                <li>
                  <button 
                    onClick={() => {
                      // Access the useAuth hook to set redirect mode
                      const { setUseRedirectAuth } = useAuth();
                      setUseRedirectAuth(true);
                      handleSocialLogin();
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    Try redirect login instead
                  </button>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Firebase handles both sign up and sign in automatically */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to Payoova? Firebase will create your account automatically!
          </p>
        </div>


        {/* Social Login Options */}
        <div className="space-y-4">
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
              onClick={handleSocialLogin}
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
              onClick={handleSocialLogin}
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
