import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // For development, bypass authentication
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return {
      user: { id: "dev-user", email: "dev@payoova.com", firstName: "Dev", lastName: "User" },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
