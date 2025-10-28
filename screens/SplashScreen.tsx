import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useAuth } from "@/lib/auth/useAuth";
import { authService } from "@/lib/auth/auth-client";

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [validatingSession, setValidatingSession] = useState(false);

  useEffect(() => {
    // Attendre que le chargement de la session soit terminé
    if (loading) return;

    const checkSession = async () => {
      // Si l'utilisateur semble authentifié, valider la session
      if (session.isAuthenticated) {
        setValidatingSession(true);
        const isValid = await authService.validateSession();
        setValidatingSession(false);

        if (!isValid) {
          // Session invalide (token blacklisté/expiré)
          console.log("🔒 Session expirée détectée au démarrage");
          router.replace("/login");
          return;
        }
      }

      // Délai de 2 secondes pour afficher le splash screen
      const timer = setTimeout(() => {
        if (session.isAuthenticated) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    checkSession();
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
        <Text className="text-white text-sm">
          {validatingSession ? "Vérification de la session..." : "Chargement..."}
        </Text>
      </View>
    </View>
  );
}
