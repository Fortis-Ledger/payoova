import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

const API_BASE_URL = "";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Get Firebase token from localStorage
  const token = localStorage.getItem("firebase_token") || "";

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Authorization": `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    // Get Firebase token from localStorage
    const token = localStorage.getItem("firebase_token") || "";

    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

    try {
      const res = await fetch(fullUrl, {
        headers: {
          "Authorization": `Bearer ${token || ""}`,
        },
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Unauthorized request to ${url}, returning null as configured`);
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query failed for ${url}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
