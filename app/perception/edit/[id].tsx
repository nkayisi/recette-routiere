import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getPerceptionById, updatePerception, type Perception } from "@/lib/api/perception.api";
import { peageSchema, taxeSchema } from "@/lib/schemas/perception.schema";
import type { PerceptionFormData } from "@/lib/schemas/perception.schema";

// Mapper les valeurs d'usage de la BDD vers le format du formulaire
const mapUsageFromDB = (usage: string | undefined): string | undefined => {
  if (!usage) return undefined;
  
  const usageLower = usage.toLowerCase();
  const usageMap: Record<string, string> = {
    "transport": "Transport",
    "commercial": "Commercial",
    "agricole": "Agricole",
    "personnel": "Personnel",
    "professionnel": "Professionnel",
    "location": "Location",
    "prive": "Personnel", // Ancien format
    "privé": "Personnel", // Avec accent
  };
  
  // Si la valeur existe dans le map, l'utiliser, sinon capitaliser la première lettre
  return usageMap[usageLower] || usage.charAt(0).toUpperCase() + usage.slice(1).toLowerCase();
};

export default function EditPerceptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(0);

  // Récupérer les détails de la perception
  const {
    data: perception,
    isLoading,
    error,
  } = useQuery<Perception, Error>({
    queryKey: ["perception", id],
    queryFn: () => getPerceptionById(parseInt(id)),
    enabled: !!id,
  });

  // Déterminer le type de perception pour le schéma de validation
  const typePerception = perception?.type_recette;

  // Calculer le resolver approprié en fonction du type de perception
  const validationResolver = useMemo(() => {
    // Si on ne connaît pas encore le type, utiliser peageSchema par défaut
    // mais cela sera mis à jour dès que perception sera chargé
    const schema = typePerception === "taxe_routiere" ? taxeSchema : peageSchema;
    return zodResolver(schema);
  }, [typePerception]);

  // React Hook Form avec validation Zod
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: validationResolver,
  });

  const watchVehiculeType = watch("vehicule_type");
  const watchCategorie = watch("categorie");

  // Pré-remplir le formulaire avec les données de la perception
  useEffect(() => {
    if (perception) {
      const formData: any = {
        type_perception: perception.type_recette,
        numero_plaque: perception.immatriculation,
        description: perception.description || "",
        usage: mapUsageFromDB(perception.usage_engin),
      };

      if (perception.type_recette === "peage") {
        formData.vehicule_type = perception.type_engin;
        if (perception.type_engin === "vehicule") {
          formData.categorie = perception.categorie_engin;
        }
      } else {
        // Taxe routière
        formData.poids_engin = perception.poids_engin?.toString() || "";
        formData.montant = perception.montant;
      }

      // Réinitialiser le formulaire avec les nouvelles données
      // Cela force aussi la réapplication du resolver approprié
      reset(formData, {
        keepDefaultValues: false,
      });
    }
  }, [perception, reset, validationResolver]);

  // Réinitialiser les champs spécifiques quand le type d'engin change
  useEffect(() => {
    if (watchVehiculeType === "moto") {
      setValue("categorie", "standard");
    } else if (watchVehiculeType === "vehicule" && !watchCategorie) {
      setValue("categorie", perception?.categorie_engin || undefined);
    }
    setFormKey((prev) => prev + 1);
  }, [watchVehiculeType, setValue, perception]);

  // Calcul automatique du prix pour le péage
  const calculatePeagePrice = () => {
    if (typePerception !== "peage" || !watchVehiculeType || !watchCategorie)
      return "";

    const prices: { [key: string]: number } = {
      "moto-standard": 500,
      "vehicule-leger": 1000,
      "vehicule-moyen": 2000,
      "vehicule-lourd": 3500,
      "vehicule-transport": 5000,
    };

    const key =
      watchVehiculeType === "moto"
        ? "moto-standard"
        : `${watchVehiculeType}-${watchCategorie}`;
    return prices[key] ? `${prices[key]} FC` : "";
  };

  // Mutation pour mettre à jour la perception
  const updateMutation = useMutation({
    mutationFn: (data: PerceptionFormData) =>
      updatePerception(parseInt(id), data),
    onSuccess: (data) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ["perception", id] });
      queryClient.invalidateQueries({ queryKey: ["perceptions"] });

      Alert.alert(
        "Succès",
        "La perception a été modifiée avec succès",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: Error) => {
      Alert.alert("Erreur", error.message);
    },
  });

  // Fonction de soumission
  const onSubmit = async (data: any) => {
    if (!perception) return;

    console.log("📝 Données du formulaire avant validation:", data);
    console.log("🔍 Type de perception:", perception.type_recette);
    console.log("✅ Schéma utilisé:", perception.type_recette === "taxe_routiere" ? "taxeSchema" : "peageSchema");

    // Vérifier si la perception peut être modifiée
    if (perception.checkings_count > 0) {
      Alert.alert(
        "Modification impossible",
        "Cette perception a déjà été vérifiée par un autre poste et ne peut plus être modifiée.",
        [{ text: "OK" }]
      );
      return;
    }

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Modifier la perception
            </Text>
          </View>
        </View>

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
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Modifier la perception
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-red-500 text-center mt-4 text-base">
            {error?.message || "Perception introuvable"}
          </Text>
        </View>
      </View>
    );
  }

  // Vérifier si la perception peut être modifiée
  const canEdit = perception.checkings_count === 0;

  if (!canEdit) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Modifier la perception
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-5">
          <Ionicons name="lock-closed-outline" size={64} color="#f59e0b" />
          <Text className="text-amber-600 text-center mt-4 text-lg font-semibold">
            Modification impossible
          </Text>
          <Text className="text-gray-600 text-center mt-2 text-base">
            Cette perception a déjà été vérifiée ({perception.checkings_count}{" "}
            vérification{perception.checkings_count > 1 ? "s" : ""}) et ne peut
            plus être modifiée.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-black rounded-full px-6 py-3"
          >
            <Text className="text-white font-semibold">Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black ml-4">
              Modifier la perception
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-500 mt-2 ml-14">
          N° {perception.numero}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Type de perception (lecture seule) */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Type de perception
          </Text>
          <View className="bg-gray-100 rounded-xl p-4">
            <Text className="text-base text-gray-600">
              {typePerception === "peage" ? "Péage" : "Taxe routière"}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            Le type de perception ne peut pas être modifié
          </Text>
        </View>

        {/* Formulaire selon le type */}
        {typePerception === "peage" ? (
          <>
            {/* Type d'engin */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Type de l'engin *
              </Text>
              <Controller
                control={control}
                name="vehicule_type"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 border rounded-xl p-4 ${
                        value === "moto"
                          ? "bg-card-blue border-blue-400"
                          : "bg-white border-[#e5e5e5]"
                      }`}
                      onPress={() => onChange("moto")}
                    >
                      <View className="items-center">
                        <Ionicons name="bicycle" size={24} color="#000" />
                        <Text className="font-semibold mt-2">Moto</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 border rounded-xl p-4 ${
                        value === "vehicule"
                          ? "bg-card-blue border-blue-400"
                          : "bg-white border-[#e5e5e5]"
                      }`}
                      onPress={() => onChange("vehicule")}
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
                <Text className="text-red-500 text-sm mt-1">
                  {errors.vehicule_type.message as string}
                </Text>
              )}
            </View>

            {/* Catégorie (pour véhicules uniquement) */}
            {watchVehiculeType === "vehicule" && (
              <View className="mt-4" key={`categorie-${formKey}`}>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Catégorie de véhicule *
                </Text>
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
                          className={`flex-row justify-between items-center border rounded-xl p-4 ${
                            value === cat.id
                              ? "bg-card-green border-green-400"
                              : "bg-white border-[#e5e5e5]"
                          }`}
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
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.categorie.message as string}
                  </Text>
                )}
              </View>
            )}

            {/* Usage */}
            {(watchVehiculeType === "moto" ||
              (watchVehiculeType === "vehicule" && watchCategorie)) && (
              <View className="mt-4" key={`usage-${formKey}`}>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Usage de l'engin *
                </Text>
                <Controller
                  control={control}
                  name="usage"
                  render={({ field: { onChange, value } }) => (
                    <View className="flex-row flex-wrap gap-3">
                      {["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"].map((u) => (
                        <TouchableOpacity
                          key={u}
                          className={`px-5 py-3 rounded-xl border ${
                            value === u
                              ? "bg-card-yellow border-yellow-400"
                              : "bg-white border-[#e5e5e5]"
                          }`}
                          onPress={() => onChange(u)}
                        >
                          <Text className="font-semibold">{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                />
                {errors.usage && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.usage.message as string}
                  </Text>
                )}
              </View>
            )}

            {/* Montant calculé automatiquement */}
            {calculatePeagePrice() && (
              <View className="mt-4 bg-card-green border border-green-300 rounded-xl p-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">
                  Montant du péage
                </Text>
                <Text className="text-3xl font-bold text-black">
                  {calculatePeagePrice()}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Poids */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Poids du véhicule (kg) *
              </Text>
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
                <Text className="text-red-500 text-sm mt-1">
                  {errors.poids_engin.message as string}
                </Text>
              )}
            </View>

            {/* Usage */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Usage de l'engin *
              </Text>
              <Controller
                control={control}
                name="usage"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row flex-wrap gap-3">
                    {["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"].map((u) => (
                      <TouchableOpacity
                        key={u}
                        className={`px-5 py-3 rounded-xl border ${
                          value === u
                            ? "bg-card-yellow border-yellow-400"
                            : "bg-white border-[#e5e5e5]"
                        }`}
                        onPress={() => onChange(u)}
                      >
                        <Text className="font-semibold">{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              {errors.usage && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.usage.message as string}
                </Text>
              )}
            </View>

            {/* Montant */}
            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Montant (FC) *
              </Text>
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
                <Text className="text-red-500 text-sm mt-1">
                  {errors.montant.message as string}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Numéro de plaque */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Numéro de plaque *
          </Text>
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
            <Text className="text-red-500 text-sm mt-1">
              {errors.numero_plaque.message as string}
            </Text>
          )}
        </View>

        {/* Description */}
        <View className="mt-4 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Description (optionnel)
          </Text>
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
      </ScrollView>

      {/* Boutons d'action */}
      <View className="px-5 pb-8 pt-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className={`rounded-full py-4 ${
            updateMutation.isPending || !isDirty
              ? "bg-gray-300"
              : "bg-black"
          }`}
          onPress={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending || !isDirty}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-base">
              {isDirty ? "Enregistrer les modifications" : "Aucune modification"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 rounded-full py-4 bg-gray-100"
          onPress={() => router.back()}
          disabled={updateMutation.isPending}
        >
          <Text className="text-black text-center font-semibold text-base">
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
