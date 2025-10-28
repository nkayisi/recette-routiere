import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getPerceptionById, type Perception } from "@/lib/api/perception.api";

export default function PerceptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Récupérer les détails de la perception
  const {
    data: perception,
    isLoading,
    error,
    refetch,
  } = useQuery<Perception, Error>({
    queryKey: ["perception", id],
    queryFn: () => getPerceptionById(parseInt(id)),
    enabled: !!id,
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formater le montant
  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")} FC`;
  };

  // Partager la perception
  const handleShare = async () => {
    if (!perception) return;

    try {
      await Share.share({
        message: `Perception ${perception.type_recette === "peage" ? "Péage" : "Taxe routière"}
N° ${perception.numero}
Immatriculation: ${perception.immatriculation}
Montant: ${formatAmount(perception.montant)}
Date: ${formatDate(perception.created_at)}
Poste: ${perception.poste.nom}`,
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  };

  // Imprimer le reçu
  const handlePrint = () => {
    Alert.alert(
      "Impression",
      "Fonctionnalité d'impression à venir",
      [{ text: "OK" }]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Détails de la perception
            </Text>
          </View>
        </View>

        {/* Loading */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-600 mt-4">Chargement...</Text>
        </View>
      </View>
    );
  }

  if (error || !perception) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Détails de la perception
            </Text>
          </View>
        </View>

        {/* Error */}
        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-center mt-4 text-base">
            {error?.message || "Perception introuvable"}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-6 bg-black rounded-full px-6 py-3"
          >
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const typeLabel =
    perception.type_recette === "peage" ? "Péage" : "Taxe routière";
  const typeEnginLabel = perception.type_engin === "moto" ? "Moto" : "Véhicule";
  const categorieLabel = perception.categorie_engin
    ? perception.categorie_engin.charAt(0).toUpperCase() +
      perception.categorie_engin.slice(1)
    : null;
  const usageLabel = perception.usage_engin
    ? perception.usage_engin.charAt(0).toUpperCase() +
      perception.usage_engin.slice(1)
    : null;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-[60px] pb-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Détails de la perception
            </Text>
          </View>

          {/* Actions rapides */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="share-outline" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePrint}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="print-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Carte principale */}
        <View className="mx-5 mt-5 bg-white rounded-2xl p-5 border-[1px] border-gray-200">
          {/* Type et statut */}
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-2xl font-bold text-black mb-1">
                {typeLabel}
              </Text>
              <Text className="text-sm text-gray-500">N° {perception.numero}</Text>
            </View>
            <View className="px-4 py-2 rounded-full bg-green-100">
              <Text className="text-sm font-semibold text-green-800">
                Validé
              </Text>
            </View>
          </View>

          {/* Montant */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-sm text-gray-600 mb-1">Montant perçu</Text>
            <Text className="text-3xl font-bold text-black">
              {formatAmount(perception.montant)}
            </Text>
          </View>

          {/* Informations du véhicule */}
          <View className="mb-4">
            <Text className="text-base font-bold text-black mb-3">
              Informations de l'engin
            </Text>

            <View className="gap-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 justify-center items-center">
                  <Ionicons name="car-outline" size={20} color="#3b82f6" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-gray-500">Type d'engin</Text>
                  <Text className="text-base text-black font-semibold">
                    {typeEnginLabel}
                    {categorieLabel ? ` - ${categorieLabel}` : ""}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-purple-50 justify-center items-center">
                  <Ionicons name="card-outline" size={20} color="#9333ea" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-gray-500">Immatriculation</Text>
                  <Text className="text-base text-black font-semibold">
                    {perception.immatriculation}
                  </Text>
                </View>
              </View>

              {usageLabel && (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-orange-50 justify-center items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color="#f97316"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-gray-500">Usage</Text>
                    <Text className="text-base text-black font-semibold">
                      {usageLabel}
                    </Text>
                  </View>
                </View>
              )}

              {perception.poids_engin && (
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-yellow-50 justify-center items-center">
                    <Ionicons name="barbell-outline" size={20} color="#eab308" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-gray-500">Poids</Text>
                    <Text className="text-base text-black font-semibold">
                      {perception.poids_engin} kg
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {perception.description && (
            <View className="mb-4 pt-4 border-t border-gray-100">
              <Text className="text-base font-bold text-black mb-2">
                Description
              </Text>
              <Text
                className="text-sm text-gray-700 leading-5"
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {perception.description}
              </Text>
              {perception.description.length > 100 && (
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2"
                >
                  <Text className="text-blue-600 text-sm font-semibold">
                    {showFullDescription ? "Voir moins" : "Voir plus"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Informations du poste */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-5 border-[1px] border-gray-200">
          <Text className="text-base font-bold text-black mb-3">
            Informations du poste
          </Text>

          <View className="gap-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-50 justify-center items-center">
                <Ionicons name="location-outline" size={20} color="#22c55e" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Poste de perception</Text>
                <Text className="text-base text-black font-semibold">
                  {perception.poste.nom}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-indigo-50 justify-center items-center">
                <Ionicons name="business-outline" size={20} color="#6366f1" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Zone</Text>
                <Text className="text-base text-black font-semibold">
                  {perception.poste.zone.nom}
                </Text>
              </View>
            </View>

            {perception.poste.adresse && (
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-pink-50 justify-center items-center">
                  <Ionicons name="navigate-outline" size={20} color="#ec4899" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-gray-500">Adresse</Text>
                  <Text className="text-base text-black font-semibold">
                    {perception.poste.adresse}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Informations de l'agent */}
        <View className="mx-5 mt-4 bg-white rounded-2xl p-5 border-[1px] border-gray-200">
          <Text className="text-base font-bold text-black mb-3">
            Agent de perception
          </Text>

          <View className="gap-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-cyan-50 justify-center items-center">
                <Ionicons name="person-outline" size={20} color="#06b6d4" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">ID Agent</Text>
                <Text className="text-base text-black font-semibold">
                  {perception.agent.ID_agent}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Métadonnées */}
        <View className="mx-5 mt-4 mb-5 bg-white rounded-2xl p-5 border-[1px] border-gray-200">
          <Text className="text-base font-bold text-black mb-3">
            Informations système
          </Text>

          <View className="gap-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Date de création</Text>
                <Text className="text-base text-black font-semibold">
                  {formatDate(perception.created_at)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name="time-outline" size={20} color="#6b7280" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">
                  Dernière modification
                </Text>
                <Text className="text-base text-black font-semibold">
                  {formatDate(perception.updated_at)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name="checkmark-done-outline" size={20} color="#6b7280" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Vérifications</Text>
                <Text className="text-base text-black font-semibold">
                  {perception.checkings_count} vérification
                  {perception.checkings_count > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bouton de modification (si modifiable) */}
        {perception.checkings_count === 0 && (
          <View className="mx-5 mt-4 mb-5">
            <TouchableOpacity
              onPress={() => router.push(`/perception/edit/${perception.id}` as any)}
              className="bg-black rounded-2xl p-5 flex-row items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Modifier cette perception
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-500 text-center mt-2">
              Cette perception peut être modifiée car elle n'a pas encore été vérifiée
            </Text>
          </View>
        )}

        {/* Message si non modifiable */}
        {perception.checkings_count > 0 && (
          <View className="mx-5 mt-4 mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <View className="flex-row items-center">
              <Ionicons name="lock-closed-outline" size={20} color="#f59e0b" />
              <Text className="text-amber-800 font-semibold ml-2 flex-1">
                Modification verrouillée
              </Text>
            </View>
            <Text className="text-amber-700 text-sm mt-2">
              Cette perception a été vérifiée {perception.checkings_count} fois et ne peut plus être modifiée.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
