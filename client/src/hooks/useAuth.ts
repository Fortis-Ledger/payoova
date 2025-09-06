import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  wallets?: {
    eth?: { address: string };
    bnb?: { address: string };
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  // Initialize redirect preference from localStorage
  const [useRedirectAuth, setUseRedirectAuth] = useState<boolean>(() => {
    return localStorage.getItem('use_redirect_auth') === 'true';
  });
  
  // Persist redirect preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('use_redirect_auth', useRedirectAuth.toString());
  }, [useRedirectAuth]);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log("Setting up Firebase auth state listener");
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      console.log("Firebase auth state changed:", user ? `User: ${user.email}` : "No user");

      // Prevent unnecessary state updates
      setFirebaseUser(prevUser => {
        if (prevUser?.uid === user?.uid) return prevUser;
        return user;
      });

      if (user) {
        try {
          // Store Firebase ID token
          const token = await user.getIdToken();
          console.log("Firebase token obtained and stored");
          localStorage.setItem("firebase_token", token);
        } catch (error) {
          console.error("Error getting Firebase token:", error);
        }
      } else {
        localStorage.removeItem("firebase_token");
      }

      // Ensure loading state is updated
      setLocalLoading(false);
    });

    return () => {
      console.log("Cleaning up Firebase auth listener");
      isMounted = false;
      unsubscribe();
    };
  }, []);
  
  // Handle redirect result when user returns to the page
  useEffect(() => {
    async function checkRedirectResult() {
      try {
        // Only import when needed to reduce bundle size
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);

        if (result) {
          console.log("Redirect authentication successful:", result.user.email);
          // User is already set by onAuthStateChanged, but we can handle any additional logic here
          // The routing will automatically handle navigation to dashboard since isAuthenticated will be true
        }
      } catch (error) {
        console.error("Redirect authentication error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Only show alert for actual errors, not for "no redirect result" which is normal
        if (!errorMessage.includes('null')) {
          alert(`Redirect login failed: ${errorMessage}`);
        }
      }
    }

    // Check for redirect result when component mounts
    checkRedirectResult();
  }, []);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"], // User identified from Firebase token
    retry: 1, // Only retry once on failure
    enabled: !!firebaseUser && !!localStorage.getItem("firebase_token"), // Only fetch if we have both Firebase user and token
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: true, // Always refetch on mount to ensure we have the latest data
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Starting Firebase authentication...", new Date().toISOString());
        console.log("Current auth state:", { 
          firebaseUser: firebaseUser ? "exists" : "null", 
          useRedirectAuth, 
          hasToken: !!localStorage.getItem("firebase_token") 
        });
        
        // Check if we're in an iframe, which can cause popup issues
        const isInIframe = window !== window.top;
        console.log("Is in iframe:", isInIframe);
        
        if (isInIframe) {
          // If in iframe, redirect to a new window for auth
          console.log("Detected iframe, opening new window");
          window.open(window.location.href, '_blank');
          return null;
        }
        
        // Set popup configuration to help prevent blocking
        console.log("Setting Google provider parameters");
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });
        
        // Use redirect auth if user has previously encountered popup issues
        if (useRedirectAuth) {
          console.log("Using redirect authentication method...", new Date().toISOString());
          try {
            // Import the redirect method only when needed to reduce bundle size
            const { signInWithRedirect } = await import('firebase/auth');
            console.log("Redirect method imported, initiating redirect");
            await signInWithRedirect(auth, googleProvider);
            console.log("Redirect initiated"); // This may not execute as page redirects
            // This function won't return as the page will redirect
            return null;
          } catch (redirectError) {
            console.error("Error during redirect auth:", redirectError);
            throw redirectError;
          }
        }
        
        // Inform user about popup
        console.log("Opening Google login popup...", new Date().toISOString());
        
        try {
          console.log("Calling signInWithPopup");
          const result = await signInWithPopup(auth, googleProvider);
          console.log("Firebase auth successful:", result.user.email);

          console.log("Getting ID token");
          const token = await result.user.getIdToken();
          console.log("Got Firebase token");

          // Store token
          localStorage.setItem("firebase_token", token);
          console.log("Token stored in localStorage");

          return result.user;
        } catch (popupError) {
          console.error("Error during popup auth:", popupError);
          throw popupError;
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log("Error message:", errorMessage);
        
        // Special handling for popup blocked error
        if (errorMessage.includes('auth/popup-blocked')) {
          console.log("Popup was blocked, switching to redirect method");
          // Switch to redirect method for future attempts
          setUseRedirectAuth(true);
          alert('Popup was blocked. We will try a different login method. Please try again.');
        } else {
          alert(`Login failed: ${errorMessage}`);
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Login mutation successful, invalidating queries");
      // Only invalidate if we don't already have user data
      if (!user) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await signOut(auth);
        localStorage.removeItem("firebase_token");
        return null;
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
    },
  });

  // Add error logging for debugging
  if (error) {
    console.error("API error in useAuth:", error);
  }

  // Determine authentication state more carefully
  const isAuthenticated = !!firebaseUser;
  const isActuallyLoading = isLoading; // Show loading during any authentication process

  // Create a wrapped login function with better error handling
  const login = () => {
    console.log("Login function called", new Date().toISOString());
    try {
      // Check if Firebase is properly initialized
      if (!auth) {
        console.error("Firebase auth is not initialized");
        alert("Authentication service is not available. Please try again later.");
        return;
      }
      
      // Check if Google provider is properly initialized
      if (!googleProvider) {
        console.error("Google provider is not initialized");
        alert("Google authentication is not available. Please try again later.");
        return;
      }
      
      console.log("Calling loginMutation.mutate");
      loginMutation.mutate();
    } catch (error) {
      console.error("Error in login function:", error);
      alert("Failed to start login process. Please try again.");
    }
  };
  
  // Local loading state for auth initialization
  const [localLoading, setLocalLoading] = useState(true);
  
  return {
    user,
    firebaseUser,
    isLoading: isActuallyLoading || loginMutation.isPending || localLoading,
    isAuthenticated,
    isActuallyLoading,
    login,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    error, // Expose error for debugging
    setUseRedirectAuth,
    useRedirectAuth,
    isAuthReady: !!auth && !!googleProvider,
  };
}
