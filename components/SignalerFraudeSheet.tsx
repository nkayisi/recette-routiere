import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fraudeSchema, type FraudeFormData } from "@/lib/schemas/fraude.schema";
import { createSignalement } from "@/lib/api/fraude.api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SignalerFraudeSheet({ visible, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  // React Hook Form avec validation Zod
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FraudeFormData>({
    resolver: zodResolver(fraudeSchema),
    defaultValues: {
      type_fraude: undefined,
      localisation: "",
      description: "",
      contact: "",
    },
  });

  const watchTypeFraude = watch("type_fraude");

  const handleClose = () => {
    reset();
    onClose();
  };

  // Fonction de soumission
  const onSubmit = async (data: FraudeFormData) => {
    console.log("🚀 Soumission du signalement avec:", data);
    console.log("❌ Erreurs de validation:", errors);

    setLoading(true);
    try {
      // Appeler l'API pour créer le signalement
      const signalement = await createSignalement(data);

      console.log("✅ Signalement créé:", signalement);

      Alert.alert(
        "Succès",
        "Votre signalement a été enregistré avec succès. Il sera traité dans les plus brefs délais.",
        [
          {
            text: "OK",
            onPress: () => {
              handleClose();
              if (onSuccess) onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
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
              <Text className="text-sm font-semibold text-gray-700 mb-3">Type de fraude *</Text>
              <Controller
                control={control}
                name="type_fraude"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {fraudTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => onChange(type.id)}
                        className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                          value === type.id ? "bg-card-yellow border-yellow-400" : "bg-white border-[#e5e5e5]"
                        }`}
                      >
                        <Ionicons name={type.icon as any} size={20} color="#000" />
                        <Text className="font-semibold">{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.type_fraude && (
                <Text className="text-red-500 text-sm mt-1">{errors.type_fraude.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Localisation *</Text>
              <Controller
                control={control}
                name="localisation"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Lieu de l'incident"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.localisation && (
                <Text className="text-red-500 text-sm mt-1">{errors.localisation.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description détaillée *</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Décrivez l'incident en détail... (min. 10 caractères)"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.description && (
                <Text className="text-red-500 text-sm mt-1">{errors.description.message}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Numéro de contact (optionnel)</Text>
              <Controller
                control={control}
                name="contact"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="+243 XXX XXX XXX"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.contact && (
                <Text className="text-red-500 text-sm mt-1">{errors.contact.message}</Text>
              )}
            </View>

            <View className="gap-3 mt-4 mb-6">
              <TouchableOpacity
                className={`bg-black rounded-full py-4 ${loading ? "opacity-50" : ""}`}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">Envoyer le signalement</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white border border-[#e5e5e5] rounded-full py-4"
                disabled={loading}
              >
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
