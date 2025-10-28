import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAgentPerceptions, type Perception } from "@/lib/api/perception.api";
import { useAuth } from "@/lib/auth/useAuth";
import { useRouter } from "expo-router";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HistoriqueSheet({ visible, onClose }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");
  
  const handleClose = () => {
    onClose();
  };

  // Calculer les dates de filtrage
  const getDateFilter = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    if (filter === "today") {
      return {
        date_debut: formatDate(today),
        date_fin: formatDate(today),
      };
    }
    
    if (filter === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return {
        date_debut: formatDate(weekAgo),
        date_fin: formatDate(today),
      };
    }
    
    return {};
  };

  // Infinite Query pour récupérer les perceptions avec pagination automatique
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['perceptions', user?.agent_id, filter],
    queryFn: ({ pageParam = 1 }) => getAgentPerceptions(user?.agent_id!, {
      page: pageParam,
      page_size: 10,
      ...getDateFilter(),
    }),
    getNextPageParam: (lastPage) => {
      // Si next existe, extraire le numéro de page de l'URL
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        const page = url.searchParams.get('page');
        return page ? parseInt(page) : undefined;
      }
      return undefined;
    },
    enabled: !!user?.agent_id && visible,
    staleTime: 1 * 60 * 1000,
    initialPageParam: 1,
  });

  // Aplatir toutes les pages en un seul tableau
  const perceptions = data?.pages.flatMap(page => page.results) || [];

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 0) {
      return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[24px] h-[80%] px-5 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-black">Historique Rapide</Text>
            <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity 
              className={`rounded-full px-4 py-2 ${filter === "all" ? "bg-black" : "bg-white border border-[#e5e5e5]"}`}
              onPress={() => setFilter("all")}
            >
              <Text className={`font-semibold ${filter === "all" ? "text-white" : "text-black"}`}>Toutes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`rounded-full px-4 py-2 ${filter === "today" ? "bg-black" : "bg-white border border-[#e5e5e5]"}`}
              onPress={() => setFilter("today")}
            >
              <Text className={`font-semibold ${filter === "today" ? "text-white" : "text-black"}`}>Aujourd'hui</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`rounded-full px-4 py-2 ${filter === "week" ? "bg-black" : "bg-white border border-[#e5e5e5]"}`}
              onPress={() => setFilter("week")}
            >
              <Text className={`font-semibold ${filter === "week" ? "text-white" : "text-black"}`}>Cette semaine</Text>
            </TouchableOpacity>
          </View>

          {/* Message d'erreur */}
          {isError && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-800 text-sm">{(error as Error).message}</Text>
            </View>
          )}

          {/* Loader initial */}
          {isLoading && perceptions.length === 0 && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#000" />
              <Text className="text-gray-600 mt-4">Chargement des perceptions...</Text>
            </View>
          )}

          {/* Liste vide */}
          {!isLoading && perceptions.length === 0 && (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text className="text-gray-600 mt-4 text-center">Aucune perception trouvée</Text>
            </View>
          )}

          {/* Liste des perceptions */}
          {perceptions.length > 0 && (
            <FlatList
              data={perceptions}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
              }
              renderItem={({ item }) => {
                const typeLabel = item.type_recette === "peage" ? "Péage" : "Taxe routière";
                const montantFormate = `${parseFloat(item.montant).toLocaleString()} FC`;
                const dateFormatee = formatDate(item.created_at);
                
                // Type d'engin
                const typeEnginLabel = item.type_engin === "moto" ? "Moto" : "Véhicule";
                
                // Catégorie (pour véhicules uniquement)
                const categorieLabel = item.categorie_engin 
                  ? item.categorie_engin.charAt(0).toUpperCase() + item.categorie_engin.slice(1)
                  : null;
                
                // Usage
                const usageLabel = item.usage_engin 
                  ? item.usage_engin.charAt(0).toUpperCase() + item.usage_engin.slice(1)
                  : null;
                
                return (
                  <View className="bg-white border border-[#e5e5e5] rounded-2xl p-4 mb-3">
                    {/* Header avec type et statut */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-black mb-1">{typeLabel}</Text>
                        <Text className="text-xs text-gray-500">N° {item.numero}</Text>
                      </View>
                      <View className="px-3 py-1 rounded-full bg-card-green">
                        <Text className="text-xs font-semibold">Validé</Text>
                      </View>
                    </View>

                    {/* Informations principales */}
                    <View className="mb-3 gap-1">
                      <View className="flex-row items-center">
                        <Ionicons name="car-outline" size={14} color="#666" />
                        <Text className="text-sm text-gray-700 ml-2">
                          {typeEnginLabel}{categorieLabel ? ` - ${categorieLabel}` : ""}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Ionicons name="card-outline" size={14} color="#666" />
                        <Text className="text-sm text-gray-700 ml-2">Plaque: {item.immatriculation}</Text>
                      </View>
                      
                      {usageLabel && (
                        <View className="flex-row items-center">
                          <Ionicons name="briefcase-outline" size={14} color="#666" />
                          <Text className="text-sm text-gray-700 ml-2">Usage: {usageLabel}</Text>
                        </View>
                      )}
                    </View>

                    {/* Montant et date */}
                    <View className="flex-row justify-between items-center mb-3 pt-3 border-t border-gray-100">
                      <Text className="text-xl font-bold text-black">{montantFormate}</Text>
                      <Text className="text-sm text-gray-500">{dateFormatee}</Text>
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="flex-1 flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-lg py-2"
                        onPress={() => {
                          onClose();
                          router.push(`/perception/${item.id}` as any);
                        }}
                      >
                        <Ionicons name="eye-outline" size={16} color="#3b82f6" />
                        <Text className="text-blue-600 font-semibold text-sm ml-1">Détails</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                          item.checkings_count === 0
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                        onPress={() => {
                          if (item.checkings_count === 0) {
                            onClose();
                            router.push(`/perception/edit/${item.id}` as any);
                          } else {
                            Alert.alert(
                              "Modification impossible",
                              `Cette perception a été vérifiée ${item.checkings_count} fois et ne peut plus être modifiée.`,
                              [{ text: "OK" }]
                            );
                          }
                        }}
                      >
                        <Ionicons 
                          name={item.checkings_count === 0 ? "create-outline" : "lock-closed-outline"} 
                          size={16} 
                          color={item.checkings_count === 0 ? "#f97316" : "#9ca3af"} 
                        />
                        <Text className={`font-semibold text-sm ml-1 ${
                          item.checkings_count === 0 ? "text-orange-600" : "text-gray-400"
                        }`}>
                          {item.checkings_count === 0 ? "Modifier" : "Verrouillé"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  console.log("🔄 Chargement de la page suivante...");
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={() => (
                <View className="py-4">
                  {/* Indicateur de chargement pour la page suivante */}
                  {isFetchingNextPage && (
                    <View className="flex-row justify-center items-center py-4">
                      <ActivityIndicator size="small" color="#000" />
                      <Text className="text-gray-600 ml-2">Chargement...</Text>
                    </View>
                  )}
                  
                  {/* Message de fin */}
                  {!hasNextPage && perceptions.length > 0 && (
                    <Text className="text-center text-gray-500 text-sm">
                      Toutes les perceptions ont été chargées
                    </Text>
                  )}
                  
                  {/* Info total */}
                  {data?.pages[0]?.count && (
                    <Text className="text-center text-gray-500 text-sm mt-3">
                      {data.pages[0].count} perception{data.pages[0].count > 1 ? 's' : ''} au total
                    </Text>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
