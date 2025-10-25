import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import NouvellePerceptionSheet from "@/components/NouvellePerceptionSheet";
import ScannerRecuSheet from "@/components/ScannerRecuSheet";
import HistoriqueSheet from "@/components/HistoriqueSheet";
import SignalerFraudeSheet from "@/components/SignalerFraudeSheet";

export default function HomeScreen() {
  const router = useRouter();
  const [nouvellePerceptionVisible, setNouvellePerceptionVisible] = useState(false);
  const [scannerRecuVisible, setScannerRecuVisible] = useState(false);
  const [historiqueVisible, setHistoriqueVisible] = useState(false);
  const [signalerFraudeVisible, setSignalerFraudeVisible] = useState(false);
  return (
    <View className="flex flex-col flex-1 bg-[#f5f5f5]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-[60px] pb-5 bg-[#f5f5f5]">
        <View className="flex-row items-center">
          <TouchableOpacity className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm">
            <Ionicons name="help-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-notification-red justify-center items-center">
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-5 justify-between pb-[120px]">
        {/* Welcome Message */}
        <View className="mt-5">
          <Text className="text-[40px] font-bold text-black ios:leading-[47px] android:leading-[50px]">
            Bonjour,{"\n"}
            <Text className="text-[40px] font-bold text-black ios:leading-[47px] android:leading-[50px]">
              Quelle opération{"\n"}souhaitez-vous effectuer ?
            </Text>
          </Text>
        </View>

        {/* Action Cards Grid */}
        <View className="rounded-[24px]">
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity 
              className="flex-1 aspect-[1.3] rounded-[20px] border border-[#e5e5e5] justify-center items-center gap-2 bg-card-blue"
              onPress={() => setNouvellePerceptionVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={32} color="#000" />
              <Text className="text-base font-semibold text-black text-center">
                Nouvelle{"\n"}Perception
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 aspect-[1.3] rounded-[20px] border border-[#e5e5e5] justify-center items-center gap-2 bg-card-gray"
              onPress={() => setScannerRecuVisible(true)}
            >
              <Ionicons name="scan-outline" size={32} color="#000" />
              <Text className="text-base font-semibold text-black text-center">
                Scanner{"\n"}Reçu
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity 
              className="flex-1 aspect-[1.3] rounded-[20px] border border-[#e5e5e5] justify-center items-center gap-2 bg-card-green"
              onPress={() => setHistoriqueVisible(true)}
            >
              <Ionicons name="time-outline" size={32} color="#000" />
              <Text className="text-base font-semibold text-black text-center">
                Historique{"\n"}Rapide
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 aspect-[1.3] rounded-[20px] border border-[#e5e5e5] justify-center items-center gap-2 bg-card-yellow"
              onPress={() => setSignalerFraudeVisible(true)}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#000" />
              <Text className="text-base font-semibold text-black text-center">
                Signaler{"\n"}Fraude
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row gap-2 items-center border border-[#e5e5e5] bg-white rounded-full px-4 ios:py-5 android:py-3">
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            className="flex-1 text-base text-black"
            placeholder="Rechercher une perception, un reçu..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity className="ml-2">
            <Ionicons name="filter-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-[30px] left-0 right-0 flex-row justify-between items-center px-8">
        {/* Left side - Overlapping buttons */}
        <View className="flex-row gap-3 items-center bg-black p-3 rounded-full">
          <TouchableOpacity 
          className="w-[45px] h-[45px] rounded-full bg-white justify-center items-center shadow-2xl"
          >
            <Ionicons name="layers-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-[45px] h-[45px] rounded-full bg-[#4a4a4a] justify-center items-center shadow-2xl"
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Right side - Add button */}
        <TouchableOpacity 
          className="w-[60px] h-[60px] rounded-full bg-black justify-center items-center shadow-2xl"
          onPress={() => setNouvellePerceptionVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <NouvellePerceptionSheet visible={nouvellePerceptionVisible} onClose={() => setNouvellePerceptionVisible(false)} />
      <ScannerRecuSheet visible={scannerRecuVisible} onClose={() => setScannerRecuVisible(false)} />
      <HistoriqueSheet visible={historiqueVisible} onClose={() => setHistoriqueVisible(false)} />
      <SignalerFraudeSheet visible={signalerFraudeVisible} onClose={() => setSignalerFraudeVisible(false)} />
    </View>
  );
}
