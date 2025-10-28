import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessionExpiration } from "@/lib/auth/useSessionExpiration";
import "../global.css";

// Configuration du QueryClient pour React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function RootLayout() {
  // Gérer automatiquement l'expiration de session
  useSessionExpiration();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="verify-otp" />
        <Stack.Screen name="home" />
        <Stack.Screen name="profile" />
      </Stack>
    </QueryClientProvider>
  );
}