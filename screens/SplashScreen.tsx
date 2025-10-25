import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      // Simuler une vérification (à remplacer par une vraie logique)
      setTimeout(() => {
        // Pour l'instant, rediriger vers login après 2 secondes
        router.replace("/login");
      }, 2000);
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <StatusBar style="light" />
      
      {/* Logo/Icon */}
      <View className="w-32 h-32 bg-white rounded-full justify-center items-center mb-6">
        <Ionicons name="car-sport" size={64} color="#000" />
      </View>

      {/* App Name */}
      <Text className="text-4xl font-bold text-white mb-2">Recette Routière</Text>
      <Text className="text-base text-gray-400">Gestion des perceptions</Text>

      {/* Loading indicator */}
      <View className="mt-12">
        <Text className="text-white text-sm">Chargement...</Text>
      </View>
    </View>
  );
}
