import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  initialSearchText?: string;
}

export default function SearchModal({ visible, onClose, initialSearchText = "" }: Props) {
  const [searchText, setSearchText] = useState(initialSearchText);
  const inputRef = useRef<TextInput>(null);

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
  }, [initialSearchText]);

  // Données de démonstration
  const recentSearches = [
    "Perception #12345",
    "Reçu taxe routière",
    "Péage moto",
  ];

  const suggestions = [
    { id: 1, type: "perception", title: "Perception #12345", date: "25 Oct 2025", amount: "1000 FC" },
    { id: 2, type: "recu", title: "Reçu #67890", date: "24 Oct 2025", amount: "2000 FC" },
    { id: 3, type: "perception", title: "Perception #11111", date: "23 Oct 2025", amount: "500 FC" },
  ];

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
                    <TouchableOpacity>
                      <Text className="text-sm text-gray-500">Effacer tout</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      className="flex-row items-center py-3 border-b border-gray-100"
                      onPress={() => setSearchText(search)}
                    >
                      <Ionicons name="time-outline" size={20} color="#999" />
                      <Text className="flex-1 text-base text-black ml-3">{search}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Suggestions */}
                <View className="mt-6 mb-6">
                  <Text className="text-lg font-bold text-black mb-4">Suggestions</Text>
                  
                  {suggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="bg-gray-50 rounded-xl p-4 mb-3 flex-row items-center"
                    >
                      <View className={`w-10 h-10 rounded-full justify-center items-center ${
                        item.type === "perception" ? "bg-blue-100" : "bg-green-100"
                      }`}>
                        <Ionicons 
                          name={item.type === "perception" ? "document-text" : "receipt"} 
                          size={20} 
                          color="#000" 
                        />
                      </View>
                      
                      <View className="flex-1 ml-3">
                        <Text className="text-base font-semibold text-black">{item.title}</Text>
                        <Text className="text-sm text-gray-500 mt-1">{item.date}</Text>
                      </View>
                      
                      <Text className="text-base font-bold text-black">{item.amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                {/* Résultats de recherche */}
                <View className="mt-6 mb-6">
                  <Text className="text-sm text-gray-500 mb-4">
                    {suggestions.length} résultat(s) pour "{searchText}"
                  </Text>
                  
                  {suggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex-row items-center"
                    >
                      <View className={`w-10 h-10 rounded-full justify-center items-center ${
                        item.type === "perception" ? "bg-blue-100" : "bg-green-100"
                      }`}>
                        <Ionicons 
                          name={item.type === "perception" ? "document-text" : "receipt"} 
                          size={20} 
                          color="#000" 
                        />
                      </View>
                      
                      <View className="flex-1 ml-3">
                        <Text className="text-base font-semibold text-black">{item.title}</Text>
                        <Text className="text-sm text-gray-500 mt-1">{item.date}</Text>
                      </View>
                      
                      <Text className="text-base font-bold text-black">{item.amount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
