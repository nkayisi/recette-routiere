import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SignalerFraudeSheet({ visible, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const fraudTypes = [
    { id: "faux_recu", label: "Faux reçu", icon: "document-text-outline" },
    { id: "corruption", label: "Corruption", icon: "cash-outline" },
    { id: "vehicule_suspect", label: "Véhicule suspect", icon: "car-outline" },
    { id: "autre", label: "Autre anomalie", icon: "alert-circle-outline" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView 
          className="bg-white rounded-t-[24px] h-[90%]"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView 
            className="flex-1 px-5 pt-6" 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Signaler une Fraude</Text>
              <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="bg-card-yellow border border-yellow-300 rounded-xl p-4 mb-6 flex-row gap-3">
              <Ionicons name="warning" size={24} color="#000" />
              <Text className="flex-1 text-sm text-black">
                Les signalements sont traités de manière confidentielle et prioritaire
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">Type de fraude</Text>
              <View className="flex-row flex-wrap gap-2">
                {fraudTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setSelectedType(type.id)}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                      selectedType === type.id ? "bg-card-yellow border-yellow-400" : "bg-white border-[#e5e5e5]"
                    }`}
                  >
                    <Ionicons name={type.icon as any} size={20} color="#000" />
                    <Text className="font-semibold">{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Localisation</Text>
              <TextInput className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base" placeholder="Lieu de l'incident" />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description détaillée</Text>
              <TextInput
                className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                placeholder="Décrivez l'incident en détail..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Numéro de contact (optionnel)</Text>
              <TextInput
                className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                placeholder="+243 XXX XXX XXX"
                keyboardType="phone-pad"
              />
            </View>

            <View className="gap-3 mt-4 mb-6">
              <TouchableOpacity className="bg-black rounded-full py-4">
                <Text className="text-white text-center font-bold text-lg">Envoyer le signalement</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white border border-[#e5e5e5] rounded-full py-4">
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="camera" size={20} color="#000" />
                  <Text className="text-black text-center font-semibold">Ajouter une photo</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
