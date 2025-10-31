import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth/useAuth";
import { useState } from "react";
import { StatusBar } from "expo-status-bar";

export default function InformationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // États pour les champs éditables
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    Alert.alert(
      "Enregistrer les modifications",
      "Voulez-vous enregistrer les modifications ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Enregistrer",
          onPress: () => {
            // TODO: Appeler l'API pour mettre à jour les informations
            setIsEditing(false);
            Alert.alert("Succès", "Vos informations ont été mises à jour");
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon, label, value, editable = false, onChangeText }: any) => (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
          <Ionicons name={icon} size={20} color="#000" />
        </View>
        <Text className="text-sm text-gray-500 ml-3">{label}</Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          className="text-base font-semibold text-black bg-gray-50 rounded-xl px-4 py-3 mt-2"
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
        />
      ) : (
        <Text className="text-base font-semibold text-black ml-[52px]">
          {value || "Non renseigné"}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-black">Mes informations</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="px-4 py-2 bg-black rounded-full"
          >
            <Text className="text-white font-semibold">
              {isEditing ? "Enregistrer" : "Modifier"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* Photo de profil */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-black justify-center items-center mb-3">
            <Text className="text-white text-3xl font-bold">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </Text>
          </View>
          <Text className="text-xl font-bold text-black">
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">Agent de perception</Text>
        </View>

        {/* Informations personnelles */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Informations personnelles</Text>
          
          <InfoRow
            icon="person-outline"
            label="Prénom"
            value={user?.first_name}
          />
          
          <InfoRow
            icon="person-outline"
            label="Nom"
            value={user?.last_name}
          />
          
          <InfoRow
            icon="mail-outline"
            label="Email"
            value={email}
            editable={true}
            onChangeText={setEmail}
          />
          
          <InfoRow
            icon="call-outline"
            label="Téléphone"
            value={phone}
            editable={true}
            onChangeText={setPhone}
          />
        </View>

        {/* Informations professionnelles */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Informations professionnelles</Text>
          
          <InfoRow
            icon="id-card-outline"
            label="Matricule"
            value={user?.username}
          />
          
          <InfoRow
            icon="briefcase-outline"
            label="Poste"
            value={user?.nom_poste}
          />
          
          <InfoRow
            icon="shield-checkmark-outline"
            label="Statut"
            value="Agent de perception"
          />
        </View>

        {/* Statistiques rapides */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Statistiques</Text>
          
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card-blue rounded-2xl p-4">
              <Ionicons name="document-text-outline" size={24} color="#000" />
              <Text className="text-2xl font-bold text-black mt-2">
                {(user as any)?.perceptions_count || 0}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Perceptions</Text>
            </View>
            
            <View className="flex-1 bg-card-green rounded-2xl p-4">
              <Ionicons name="checkmark-done-outline" size={24} color="#000" />
              <Text className="text-2xl font-bold text-black mt-2">
                {(user as any)?.verifications_count || 0}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Vérifications</Text>
            </View>
          </View>
        </View>

        {/* Sécurité */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Sécurité</Text>
          
          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#000" />
              </View>
              <Text className="text-base font-semibold text-black ml-3">
                Changer le mot de passe
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
