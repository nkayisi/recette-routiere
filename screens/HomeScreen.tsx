import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import NouvellePerceptionSheet from "@/components/NouvellePerceptionSheet";
import ScannerRecuSheet from "@/components/ScannerRecuSheet";
import HistoriqueSheet from "@/components/HistoriqueSheet";
import SignalerFraudeSheet from "@/components/SignalerFraudeSheet";
import SearchModal from "@/components/SearchModal";
import NotificationsModal from "@/components/NotificationsModal";
import HelpModal from "@/components/HelpModal";
import { House } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [nouvellePerceptionVisible, setNouvellePerceptionVisible] = useState(false);
  const [scannerRecuVisible, setScannerRecuVisible] = useState(false);
  const [historiqueVisible, setHistoriqueVisible] = useState(false);
  const [signalerFraudeVisible, setSignalerFraudeVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [notificationCount, setNotificationCount] = useState(2); // Nombre de notifications non lues
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex flex-col flex-1 bg-[#f5f5f5]">
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-[60px] pb-5 bg-[#f5f5f5]">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => setHelpModalVisible(true)}
          >
            <Ionicons name="help-circle-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-notification-red justify-center items-center relative"
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white justify-center items-center border-2 border-notification-red">
                <Text className="text-[10px] font-bold text-notification-red">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 px-5 justify-between pb-[120px]">
        {/* Welcome Message */}
        <View className="mt-5">
          <Text className="text-[40px] font-bold text-black ios:leading-[47px] android:leading-[50px]">
            Salut à vous,{"\n"}
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
        <TouchableOpacity 
          className="flex-row gap-2 items-center border border-[#e5e5e5] bg-white rounded-full px-4 py-5"
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text className="flex-1 text-base text-gray-400">
            Rechercher une perception, un reçu...
          </Text>
          <Ionicons name="filter-outline" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="absolute bottom-[30px] left-0 right-0 flex-row justify-between items-center px-8">
        {/* Left side - Overlapping buttons */}
        <View className="flex-row gap-3 items-center bg-black p-3 rounded-full">
          <TouchableOpacity 
          className="w-[45px] h-[45px] rounded-full bg-white justify-center items-center shadow-2xl"
          >
            {/* <Ionicons name="house" size={26} color="#000" /> */}
            <House color="#000" size={26} />
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
        <HelpModal 
          visible={helpModalVisible} 
          onClose={() => setHelpModalVisible(false)}
        />
        <NotificationsModal 
          visible={notificationsModalVisible} 
          onClose={() => setNotificationsModalVisible(false)}
        />
        <SearchModal 
          visible={searchModalVisible} 
          onClose={() => setSearchModalVisible(false)}
          initialSearchText={searchText}
        />
        <NouvellePerceptionSheet visible={nouvellePerceptionVisible} onClose={() => setNouvellePerceptionVisible(false)} />
        <ScannerRecuSheet visible={scannerRecuVisible} onClose={() => setScannerRecuVisible(false)} />
        <HistoriqueSheet visible={historiqueVisible} onClose={() => setHistoriqueVisible(false)} />
        <SignalerFraudeSheet visible={signalerFraudeVisible} onClose={() => setSignalerFraudeVisible(false)} />
      </View>
    </TouchableWithoutFeedback>
  );
}
