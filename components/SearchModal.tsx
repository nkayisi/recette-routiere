import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useSearch } from "@/lib/hooks/useSearch";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { useRouter } from "expo-router";
import type { SearchResult } from "@/lib/api/perception.api";

interface Props {
  visible: boolean;
  onClose: () => void;
  initialSearchText?: string;
}

export default function SearchModal({ visible, onClose, initialSearchText = "" }: Props) {
  const [searchText, setSearchText] = useState(initialSearchText);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearchText);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  // Hooks pour la recherche et les recherches récentes
  const { data: searchResults, isLoading, error } = useSearch(debouncedSearch);
  const { searches: recentSearches, addSearch, clearAll } = useRecentSearches();

  useEffect(() => {
    if (visible) {
      // Auto-focus quand le modal s'ouvre
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  useEffect(() => {
    setSearchText(initialSearchText);
    setDebouncedSearch(initialSearchText);
  }, [initialSearchText]);

  // Debounce de la recherche pour éviter trop d'appels API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Gérer la soumission de la recherche
  const handleSearch = async (query: string) => {
    if (query.trim().length > 0) {
      await addSearch(query.trim());
    }
  };

  // Gérer le clic sur un résultat
  const handleResultPress = (result: SearchResult) => {
    handleSearch(result.immatriculation);
    onClose();
    // Navigation vers les détails de la perception
    router.push(`/perception/${result.id}` as any);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  // Formater le montant
  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")} FC`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1">
          {/* Header avec champ de recherche */}
          <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
            <View className="flex-row items-center gap-3 mb-4">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 ios:py-5 android:py-2">
                <Ionicons name="search-outline" size={20} color="#999" />
                <TextInput
                  ref={inputRef}
                  className="flex-1 text-base text-black ml-2"
                  placeholder="Rechercher une perception, un reçu..."
                  placeholderTextColor="#999"
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSearch(searchText)}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Contenu scrollable */}
          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {searchText.length === 0 ? (
              <>
                {/* Recherches récentes */}
                <View className="mt-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-black">Recherches récentes</Text>
                    {recentSearches.length > 0 && (
                      <TouchableOpacity onPress={clearAll}>
                        <Text className="text-sm text-gray-500">Effacer tout</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center py-3 border-b border-gray-100"
                        onPress={() => setSearchText(search)}
                      >
                        <Ionicons name="time-outline" size={20} color="#999" />
                        <Text className="flex-1 text-base text-black ml-3">{search}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text className="text-sm text-gray-400 text-center py-4">
                      Aucune recherche récente
                    </Text>
                  )}
                </View>

                {/* Suggestions - Afficher seulement si pas de recherches récentes */}
                {recentSearches.length === 0 && (
                  <View className="mt-6 mb-6">
                    <Text className="text-sm text-gray-400 text-center">
                      Commencez à taper pour rechercher une perception
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Résultats de recherche */}
                <View className="mt-6 mb-6">
                  {isLoading ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator size="large" color="#000" />
                      <Text className="text-sm text-gray-500 mt-4">Recherche en cours...</Text>
                    </View>
                  ) : error ? (
                    <View className="py-8 items-center">
                      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                      <Text className="text-sm text-red-500 mt-4 text-center px-4">
                        {error.message}
                      </Text>
                    </View>
                  ) : searchResults && searchResults.length > 0 ? (
                    <>
                      <Text className="text-sm text-gray-500 mb-4">
                        {searchResults.length} résultat(s) pour "{searchText}"
                      </Text>
                      
                      {searchResults.map((result) => (
                        <TouchableOpacity
                          key={result.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex-row items-center"
                          onPress={() => handleResultPress(result)}
                        >
                          <View className={`w-10 h-10 rounded-full justify-center items-center ${
                            result.type_recette === "peage" ? "bg-blue-100" : "bg-green-100"
                          }`}>
                            <Ionicons 
                              name="document-text" 
                              size={20} 
                              color="#000" 
                            />
                          </View>
                          
                          <View className="flex-1 ml-3">
                            <Text className="text-base font-semibold text-black">
                              {result.immatriculation}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                              {result.numero}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                              {formatDate(result.created_at)} • {result.poste_nom}
                            </Text>
                          </View>
                          
                          <View className="items-end">
                            <Text className="text-base font-bold text-black">
                              {formatAmount(result.montant)}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1">
                              {result.type_recette === "peage" ? "Péage" : "Taxe routière"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  ) : debouncedSearch.trim().length >= 2 ? (
                    <View className="py-8 items-center">
                      <Ionicons name="search-outline" size={48} color="#999" />
                      <Text className="text-sm text-gray-500 mt-4 text-center px-4">
                        Aucun résultat pour "{searchText}"
                      </Text>
                    </View>
                  ) : (
                    <View className="py-8 items-center">
                      <Ionicons name="search-outline" size={48} color="#999" />
                      <Text className="text-sm text-gray-500 mt-4 text-center px-4">
                        Entrez au moins 2 caractères pour rechercher
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
