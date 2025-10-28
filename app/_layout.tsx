import { Stack } from "expo-router";
import { useSessionExpiration } from "@/lib/auth/useSessionExpiration";
import "../global.css";

export default function RootLayout() {
  // Gérer automatiquement l'expiration de session
  useSessionExpiration();

  return (
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
  );
}
