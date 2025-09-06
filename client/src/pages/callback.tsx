import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Callback() {
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL parameters (passed by backend redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const tokenType = urlParams.get("token_type");
        const expiresIn = urlParams.get("expires_in");
        const error = urlParams.get("error");

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!accessToken) {
          throw new Error("No access token received");
        }

        // Store token with expiration
        const tokenData = {
          access_token: accessToken,
          token_type: tokenType || "Bearer",
          expires_at: Date.now() + (parseInt(expiresIn || "3600") * 1000),
          audience: "https://payoova.com/v1/", // Include API audience
        };

        localStorage.setItem("auth0_token", JSON.stringify(tokenData));

        toast({
          title: "Login Successful",
          description: "Welcome to Payoova!",
        });

        // Redirect to dashboard with a slight delay to ensure state is updated
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } catch (error) {
        console.error("Callback error:", error);
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });

        // Redirect to landing page
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    };

    handleCallback();
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
          <span className="text-lg font-medium">Processing login...</span>
        </div>
      </div>
    </div>
  );
}
