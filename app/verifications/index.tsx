import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getAgentVerifications,
  type AgentVerification,
} from "@/lib/api/perception.api";
import { useAuth } from "@/lib/auth/useAuth";

export default function VerificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Récupération des vérifications via l'API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agent-verifications", user?.agent_id],
    queryFn: () => getAgentVerifications(user?.agent_id!),
    enabled: !!user?.agent_id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")}`;
  };

  const renderVerificationItem = ({
    item,
    index,
  }: {
    item: AgentVerification;
    index: number;
  }) => {
    const recette = item.recette;
    const typeLabel =
      recette.type_recette === "peage" ? "Péage" : "Taxe routière";
    const typeColor =
      recette.type_recette === "peage" ? "bg-blue-100" : "bg-green-100";
    const typeTextColor =
      recette.type_recette === "peage" ? "text-blue-700" : "text-green-700";

    return (
      <View className="mb-4">
        {/* Card */}
        <View className="bg-white rounded-[20px] p-4 border-[1px] border-gray-200">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center mb-2">
                <View className={`${typeColor} px-2.5 py-1 rounded-full mr-2`}>
                  <Text className={`text-[9px] font-bold ${typeTextColor}`}>
                    {typeLabel.toUpperCase()}
                  </Text>
                </View>
                <View className="w-6 h-6 rounded-full bg-green-100 justify-center items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                </View>
              </View>
              <Text className="text-base font-bold text-black mb-1">
                {recette.numero}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-500 ml-1">
                  No. plaque: {recette.immatriculation}
                </Text>
              </View>
            </View>

            {/* Montant */}
            <View className="items-end">
              <Text className="text-xl font-bold text-black">
                {formatAmount(recette.montant)}
              </Text>
              <Text className="text-[10px] text-gray-500 mt-0.5">FC</Text>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text className="text-[11px] text-gray-500 ml-1">
                {formatDate(item.created_at)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text
                className="text-[11px] text-gray-500 ml-1"
                numberOfLines={1}
              >
                {item.poste.nom}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 mt-28">
      <View className="w-24 h-24 rounded-[20px] bg-gradient-to-br from-gray-100 to-gray-50 justify-center items-center mb-6">
        <Ionicons name="checkmark-done-outline" size={48} color="#9ca3af" />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">
        Aucune vérification
      </Text>
      <Text className="text-sm text-gray-500 text-center px-8 leading-5">
        Commencez à scanner des reçus pour voir votre historique de
        vérifications ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-5 pt-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-black mb-1">
              Vérifications
            </Text>
            <Text className="text-sm text-gray-500">
              Historique de vos contrôles
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center"
          >
            <Ionicons name="close" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des vérifications avec timeline */}
      <View className="flex-1 px-5 py-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#000" />
            <Text className="text-gray-600 mt-4">Chargement...</Text>
          </View>
        ) : (
          <FlatList
            data={data?.results || []}
            renderItem={renderVerificationItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#000"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
