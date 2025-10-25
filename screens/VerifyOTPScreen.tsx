import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef } from "react";
import { Text, TextInput, TouchableOpacity, View, Alert } from "react-native";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOTPChange = (value: string, index: number) => {
    // Accepter uniquement les chiffres
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus sur le champ suivant
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 4) {
      Alert.alert("Erreur", "Veuillez entrer le code complet");
      return;
    }

    setLoading(true);

    // Simuler la vérification (à remplacer par une vraie API)
    setTimeout(() => {
      setLoading(false);
      
      // Vérifier si le code est correct (exemple: 1234)
      if (otpCode === "1234") {
        // Sauvegarder la session (AsyncStorage, etc.)
        router.replace("/home");
      } else {
        Alert.alert("Erreur", "Code incorrect. Veuillez réessayer.");
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResendOTP = () => {
    Alert.alert("Code renvoyé", "Un nouveau code a été envoyé par SMS");
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-[80px] pb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white justify-center items-center mb-6"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text className="text-4xl font-bold text-black text-center mb-2 mt-14">Vérification</Text>
        <Text className="text-base text-gray-600 text-center">
          Entrez le code à 4 chiffres envoyé au{"\n"}
          <Text className="font-bold">+243 {phoneNumber}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <View className="flex-1 px-5">
        <View className="flex-row gap-3 justify-center mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              className="w-[50px] h-[60px] bg-white border-2 border-[#e5e5e5] rounded-xl text-center text-2xl font-bold text-black"
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
              style={{ borderColor: digit ? "#000" : "#e5e5e5" }}
            />
          ))}
        </View>

        {/* Resend Button */}
        <TouchableOpacity onPress={handleResendOTP} className="mb-6">
          <Text className="text-center text-base text-black">
            Vous n'avez pas reçu le code ?{" "}
            <Text className="font-bold underline">Renvoyer</Text>
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          className={`rounded-full py-4 ${loading || otp.join("").length < 4 ? "bg-gray-400" : "bg-black"}`}
          onPress={handleVerifyOTP}
          disabled={loading || otp.join("").length < 4}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? "Vérification..." : "Vérifier le code"}
          </Text>
        </TouchableOpacity>

        {/* Info */}
        <View className="bg-card-yellow border border-yellow-300 rounded-xl p-4 mt-6 flex-row items-center justify-center gap-3">
          <Ionicons name="time" size={24} color="#000" />
          <Text className="flex-1 text-sm text-black">
            Le code expire dans 5 minutes
          </Text>
        </View>
      </View>
    </View>
  );
}
