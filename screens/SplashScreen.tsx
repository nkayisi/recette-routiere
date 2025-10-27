import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useAuth } from "@/lib/auth/useAuth";

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    // Attendre que le chargement de la session soit terminé
    if (loading) return;

    // Délai de 2 secondes pour afficher le splash screen
    const timer = setTimeout(() => {
      if (session.isAuthenticated) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }, 2000);

    // Nettoyer le timer si le composant est démonté
    return () => clearTimeout(timer);
  }, [loading, session.isAuthenticated]);



  return (
    <View className="flex-1 bg-black justify-center items-center">
      <StatusBar style="light" />

      {/* Logo/Icon */}
      <View className="w-32 h-32 bg-white rounded-full justify-center items-center mb-6">
        <Ionicons name="car-sport" size={64} color="#000" />
      </View>

      {/* App Name */}
      <Text className="text-4xl font-bold text-white mb-2">
        Recette Routière
      </Text>
      <Text className="text-base text-gray-400">Gestion des perceptions</Text>

      {/* Loading indicator */}
      <View className="mt-12">
        <Text className="text-white text-sm">Chargement...</Text>
      </View>
    </View>
  );
}
