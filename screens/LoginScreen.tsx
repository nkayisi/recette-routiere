import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert("Erreur", "Veuillez entrer un numéro de téléphone valide");
      return;
    }

    setLoading(true);
    
    // Simuler l'envoi d'OTP (à remplacer par une vraie API)
    setTimeout(() => {
      setLoading(false);
      // Rediriger vers la page de vérification OTP
      router.push({
        pathname: "/verify-otp",
        params: { phoneNumber }
      });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Header avec design moderne */}
      <View className="flex-col items-center justify-center px-6 pt-[120px] pb-14">
        {/* Logo moderne */}
        <View className="w-16 h-16 bg-black rounded-2xl justify-center items-center mb-8 shadow-lg">
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
        </View>
        
        <Text className="text-5xl font-bold text-black text-center mb-3 leading-tight">
          Bienvenue
        </Text>
        <Text className="text-lg text-gray-500 text-center leading-relaxed">
          Connectez-vous pour accéder à{"\n"}votre espace agent
        </Text>
      </View>

      {/* Form avec design moderne */}
      <View className="flex-1 px-6">
        {/* Phone Input Card */}
        <View className="mb-8">
          <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Numéro de téléphone
          </Text>
          <View 
            className={`flex-row items-center bg-zinc-50 rounded-2xl px-5 border-2 ${
              isFocused ? "border-black bg-white" : "border-transparent"
            }`}
          >
            <View className="flex-row items-center mr-3 py-5">
              <View className="w-8 h-8 bg-black rounded-lg justify-center items-center mr-2">
                <Ionicons name="call" size={16} color="#fff" />
              </View>
              <Text className="text-lg font-bold text-black">+243</Text>
            </View>
            <View className="h-10 w-[1px] bg-gray-300 mr-3" />
            <TextInput
              className="flex-1 text-lg font-semibold text-black"
              placeholder="812 345 678"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={9}
            />
          </View>
          <Text className="text-xs text-gray-400 mt-3 ml-1">
            Entrez votre numéro sans l'indicatif pays
          </Text>
        </View>

        {/* Info moderne */}
        <View className="bg-zinc-100 rounded-2xl p-5 mb-8 flex-row items-start gap-4">
          <View className="w-10 h-10 bg-black rounded-full justify-center items-center mt-1">
            <Ionicons name="lock-closed" size={18} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-black mb-1">
              Connexion sécurisée
            </Text>
            <Text className="text-sm text-gray-600 leading-relaxed">
              Un code de vérification à 4 chiffres sera envoyé par SMS
            </Text>
          </View>
        </View>

        {/* Button moderne */}
        <TouchableOpacity
          className={`rounded-2xl py-5 shadow-lg ${
            loading || phoneNumber.length < 9 
              ? "bg-gray-300" 
              : "bg-black"
          }`}
          onPress={handleSendOTP}
          disabled={loading || phoneNumber.length < 9}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="flex-row justify-center items-center gap-2">
            {loading ? (
              <Text className="text-white text-center font-bold text-lg">
                Envoi en cours...
              </Text>
            ) : (
              <>
                <Text className="text-white text-center font-bold text-lg">
                  Continuer
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer moderne */}
      <View className="px-6 pb-10">
        <View className="flex-row justify-center items-center gap-1">
          <Ionicons name="shield-checkmark-outline" size={16} color="#999" />
          <Text className="text-center text-xs text-gray-400">
            Connexion sécurisée et confidentielle
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
