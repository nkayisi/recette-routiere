import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

// Type pour les signalements
interface Signalement {
  id: number;
  type_fraude: string;
  localisation: string;
  description: string;
  statut: "en_attente" | "en_cours" | "resolu" | "rejete";
  created_at: string;
  updated_at: string;
}

export default function SignalementsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "en_attente" | "resolu">("all");

  // TODO: Remplacer par l'API réelle
  const fetchSignalements = async (): Promise<Signalement[]> => {
    // Simulation de données
    return [
      {
        id: 1,
        type_fraude: "faux_recu",
        localisation: "Poste de Kintambo",
        description: "Reçu suspect avec numéro non enregistré dans le système",
        statut: "en_cours",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        type_fraude: "corruption",
        localisation: "Poste de Limete",
        description: "Tentative de corruption par un conducteur",
        statut: "resolu",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        type_fraude: "vehicule_suspect",
        localisation: "Poste de Matadi",
        description: "Véhicule avec plaques d'immatriculation falsifiées",
        statut: "en_attente",
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  const { data: signalements, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["signalements", user?.agent_id, filter],
    queryFn: fetchSignalements,
    enabled: !!user?.agent_id,
  });

  const filteredSignalements = signalements?.filter((s) => {
    if (filter === "all") return true;
    return s.statut === filter;
  });

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return { label: "En attente", color: "bg-yellow-100", textColor: "text-yellow-700", icon: "time" };
      case "en_cours":
        return { label: "En cours", color: "bg-blue-100", textColor: "text-blue-700", icon: "hourglass" };
      case "resolu":
        return { label: "Résolu", color: "bg-green-100", textColor: "text-green-700", icon: "checkmark-circle" };
      case "rejete":
        return { label: "Rejeté", color: "bg-red-100", textColor: "text-red-700", icon: "close-circle" };
      default:
        return { label: statut, color: "bg-gray-100", textColor: "text-gray-700", icon: "help-circle" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "faux_recu":
        return "Faux reçu";
      case "corruption":
        return "Corruption";
      case "vehicule_suspect":
        return "Véhicule suspect";
      case "autre":
        return "Autre anomalie";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    }
  };

  const renderSignalement = ({ item }: { item: Signalement }) => {
    const statusConfig = getStatusConfig(item.statut);

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3"
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <View className={`${statusConfig.color} px-3 py-1 rounded-full`}>
                <Text className={`text-xs font-bold ${statusConfig.textColor}`}>
                  {statusConfig.label.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text className="text-base font-bold text-black">
              {getTypeLabel(item.type_fraude)}
            </Text>
          </View>
          <Ionicons name={statusConfig.icon as any} size={24} color="#999" />
        </View>

        {/* Description */}
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#9ca3af" />
            <Text className="text-xs text-gray-500 ml-1">{item.localisation}</Text>
          </View>
          <Text className="text-xs text-gray-500">{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Mes signalements</Text>
        </View>

        {/* Filtres */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { id: "all", label: "Tous" },
            { id: "en_attente", label: "En attente" },
            { id: "resolu", label: "Résolus" },
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-full ${
                filter === f.id ? "bg-black" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  filter === f.id ? "text-white" : "text-black"
                }`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des signalements */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-4">Chargement...</Text>
        </View>
      ) : filteredSignalements && filteredSignalements.length > 0 ? (
        <FlatList
          data={filteredSignalements}
          renderItem={renderSignalement}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-5 py-4"
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#000" />
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
            <Ionicons name="warning-outline" size={40} color="#999" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Aucun signalement
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            {filter === "all"
              ? "Vous n'avez effectué aucun signalement pour le moment"
              : `Aucun signalement ${filter === "en_attente" ? "en attente" : "résolu"}`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
