import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { peageSchema, taxeSchema } from "@/lib/schemas/perception.schema";
import type { PerceptionFormData } from "@/lib/schemas/perception.schema";
import { createPerception } from "@/lib/api/perception.api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NouvellePerceptionSheet({ visible, onClose, onSuccess }: Props) {
  const [typePerception, setTypePerception] = useState<"taxe_routiere" | "peage">("peage");
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer le re-render
  
  // React Hook Form avec validation Zod
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(typePerception === "peage" ? peageSchema : taxeSchema),
    defaultValues: {
      type_perception: "peage",
      numero_plaque: "",
      description: "",
    },
  });

  const watchVehiculeType = watch("vehicule_type");
  const watchCategorie = watch("categorie");

  // Réinitialiser le formulaire quand le type de perception change
  useEffect(() => {
    // Incrémenter la clé pour forcer le re-render complet du formulaire
    setFormKey(prev => prev + 1);
    
    // Réinitialiser tous les champs
    reset({
      type_perception: typePerception,
      numero_plaque: "",
      description: "",
      usage: undefined,
      vehicule_type: undefined,
      categorie: undefined,
      poids_engin: "",
      montant: "",
    });
  }, [typePerception, reset]);

  // Réinitialiser les champs spécifiques quand le type d'engin change
  useEffect(() => {
    if (watchVehiculeType === "moto") {
      setValue("categorie", "standard");
      setValue("usage", undefined); // Réinitialiser usage
    } else if (watchVehiculeType === "vehicule") {
      setValue("categorie", undefined);
      setValue("usage", undefined); // Réinitialiser usage
    }
    
    // Incrémenter formKey pour forcer le re-render des champs
    setFormKey(prev => prev + 1);
  }, [watchVehiculeType, setValue]);

  // Fonction pour fermer et réinitialiser
  const handleClose = () => {
    reset();
    setTypePerception("peage");
    onClose();
  };

  // Calcul automatique du prix pour le péage
  const calculatePeagePrice = () => {
    if (typePerception !== "peage" || !watchVehiculeType || !watchCategorie) return "";
    
    const prices: { [key: string]: number } = {
      "moto-standard": 500,
      "vehicule-leger": 1000,
      "vehicule-moyen": 2000,
      "vehicule-lourd": 3500,
      "vehicule-transport": 5000,
    };
    
    // Pour moto, toujours utiliser "standard"
    const key = watchVehiculeType === "moto" 
      ? "moto-standard" 
      : `${watchVehiculeType}-${watchCategorie}`;
    return prices[key] ? `${prices[key]} FC` : "";
  };

  // Fonction de soumission
  const onSubmit = async (data: any) => {
    console.log("🚀 Soumission du formulaire avec:", data);
    console.log("📋 Type de perception:", typePerception);
    console.log("❌ Erreurs de validation:", errors);
    
    setLoading(true);
    try {
      // Appeler l'API pour créer la perception
      const perception = await createPerception(data);
      
      console.log("✅ Perception créée:", perception);
      
      Alert.alert("Succès", "Perception enregistrée avec succès!", [
        {
          text: "OK",
          onPress: () => {
            handleClose();
            if (onSuccess) onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
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
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Nouvelle Perception</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Type de perception */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Type de perception</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className={`flex-1 border border-[#e5e5e5] rounded-xl p-4 ${typePerception === "peage" ? "bg-card-blue" : "bg-white"}`}
                  onPress={() => setTypePerception("peage")}
                >
                  <Text className="text-center font-semibold">Péage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 border border-[#e5e5e5] rounded-xl p-4 ${typePerception === "taxe_routiere" ? "bg-card-blue" : "bg-white"}`}
                  onPress={() => setTypePerception("taxe_routiere")}
                >
                  <Text className="text-center font-semibold">Taxe routière</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Champs pour TAXE ROUTIÈRE */}
            {typePerception === "taxe_routiere" && (
              <View key={`taxe-${formKey}`}>
                {/* Poids */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Poids du véhicule (kg) *</Text>
                  <Controller
                    control={control}
                    name="poids_engin"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                        placeholder="Ex: 1500"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.poids_engin && (
                    <Text className="text-red-500 text-sm mt-1">{errors.poids_engin.message as string}</Text>
                  )}
                </View>

                {/* Usage de l'engin */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Usage de l'engin *</Text>
                  <Controller
                    control={control}
                    name="usage"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row flex-wrap gap-3">
                        {["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"].map((u) => (
                          <TouchableOpacity
                            key={u}
                            className={`px-5 py-3 rounded-xl border ${value === u ? "bg-card-yellow border-yellow-400" : "bg-white border-[#e5e5e5]"}`}
                            onPress={() => onChange(u)}
                          >
                            <Text className="font-semibold">{u}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  />
                  {errors.usage && (
                    <Text className="text-red-500 text-sm mt-1">{errors.usage.message as string}</Text>
                  )}
                </View>

                {/* Montant pour taxe */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Montant (FC) *</Text>
                  <Controller
                    control={control}
                    name="montant"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                        placeholder="Entrer le montant"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  {errors.montant && (
                    <Text className="text-red-500 text-sm mt-1">{errors.montant.message as string}</Text>
                  )}
                </View>
              </View>
            )}

            {/* Champs pour PÉAGE */}
            {typePerception === "peage" && (
              <View key={`peage-${formKey}`}>
                {/* Type de l'engin */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Type de l'engin *</Text>
                  <Controller
                    control={control}
                    name="vehicule_type"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          className={`flex-1 border rounded-xl p-4 ${value === "moto" ? "bg-card-blue border-blue-400" : "bg-white border-[#e5e5e5]"}`}
                          onPress={() => {
                            onChange("moto");
                            setValue("categorie", 'standard');
                          }}
                        >
                          <View className="items-center">
                            <Ionicons name="bicycle" size={24} color="#000" />
                            <Text className="font-semibold mt-2">Moto</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className={`flex-1 border rounded-xl p-4 ${value === "vehicule" ? "bg-card-blue border-blue-400" : "bg-white border-[#e5e5e5]"}`}
                          onPress={() => {
                            onChange("vehicule");
                            setValue("categorie", undefined);
                          }}
                        >
                          <View className="items-center">
                            <Ionicons name="car" size={24} color="#000" />
                            <Text className="font-semibold mt-2">Véhicule</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {errors.vehicule_type && (
                    <Text className="text-red-500 text-sm mt-1">{errors.vehicule_type.message as string}</Text>
                  )}
                </View>

                {/* Catégorie de véhicule (si véhicule sélectionné) */}
                {watchVehiculeType === "vehicule" && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Catégorie de véhicule</Text>
                    <Controller
                      control={control}
                      name="categorie"
                      render={({ field: { onChange, value } }) => (
                        <View className="gap-2">
                          {[
                            { id: "leger", label: "Léger (< 3.5T)", price: 1000 },
                            { id: "moyen", label: "Moyen (3.5T - 7.5T)", price: 2000 },
                            { id: "lourd", label: "Lourd (> 7.5T)", price: 3500 },
                            { id: "transport", label: "Transport en commun", price: 5000 },
                          ].map((cat) => (
                            <TouchableOpacity
                              key={cat.id}
                              className={`flex-row justify-between items-center border rounded-xl p-4 ${value === cat.id ? "bg-card-green border-green-400" : "bg-white border-[#e5e5e5]"}`}
                              onPress={() => onChange(cat.id)}
                            >
                              <Text className="font-semibold">{cat.label}</Text>
                              <Text className="text-gray-600">{cat.price} FC</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    />
                    {errors.categorie && (
                      <Text className="text-red-500 text-sm mt-1">{errors.categorie.message as string}</Text>
                    )}
                  </View>
                )}

                {/* Usage de l'engin */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Usage de l'engin *</Text>
                  <Controller
                    control={control}
                    name="usage"
                    render={({ field: { onChange, value } }) => (
                      <View className="flex-row flex-wrap gap-3">
                        {["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"].map((u) => (
                          <TouchableOpacity
                            key={u}
                            className={`px-5 py-3 rounded-xl border ${value === u ? "bg-card-yellow border-yellow-400" : "bg-white border-[#e5e5e5]"}`}
                            onPress={() => onChange(u)}
                          >
                            <Text className="font-semibold">{u}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  />
                  {errors.usage && (
                    <Text className="text-red-500 text-sm mt-1">{errors.usage.message as string}</Text>
                  )}
                </View>

                {/* Montant calculé automatiquement */}
                {calculatePeagePrice() && (
                  <View className="mb-4 bg-card-green border border-green-300 rounded-xl p-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Montant du péage</Text>
                    <Text className="text-3xl font-bold text-black">{calculatePeagePrice()}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Numéro de plaque */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Numéro de plaque *</Text>
              <Controller
                control={control}
                name="numero_plaque"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Ex: CD-12345"
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.numero_plaque && (
                <Text className="text-red-500 text-sm mt-1">{errors.numero_plaque.message as string}</Text>
              )}
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description (optionnel)</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Ajouter une note..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            {/* Bouton */}
            <TouchableOpacity 
              className="bg-black justify-center items-center rounded-full py-4 mt-4 mb-6"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                  <Text className="text-white text-center font-bold text-lg">Enregistrer</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
