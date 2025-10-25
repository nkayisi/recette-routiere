import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { id: 1, icon: "person-outline", label: "Informations personnelles", color: "bg-card-blue" },
    { id: 2, icon: "stats-chart-outline", label: "Mes statistiques", color: "bg-card-green" },
    { id: 3, icon: "document-text-outline", label: "Mes rapports", color: "bg-card-yellow" },
    { id: 4, icon: "notifications-outline", label: "Notifications", color: "bg-card-gray" },
    { id: 5, icon: "settings-outline", label: "Paramètres", color: "bg-card-blue" },
    { id: 6, icon: "help-circle-outline", label: "Aide & Support", color: "bg-card-green" },
  ];

  return (
    <View className="flex-1 bg-[#f5f5f5]">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-[60px] pb-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Mon Profil</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-zinc-200 rounded-[24px] p-6">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-full bg-white justify-center items-center mr-4">
              <Ionicons name="person" size={40} color="#000" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-zinc-800 mb-1">Peter Nkayisi</Text>
              <Text className="text-base text-gray-500">Agent de terrain</Text>
              <Text className="text-sm text-gray-600 mt-1">ID: AGT-2024-001</Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-4 pt-4 border-t-[0.3px] border-gray-700">
            <View className="items-center">
              <Text className="text-2xl font-bold text-zinc-700">247</Text>
              <Text className="text-xs text-gray-900 mt-1">Perceptions</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-zinc-700">1.2M FC</Text>
              <Text className="text-xs text-gray-900 mt-1">Collecté</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-zinc-700">98%</Text>
              <Text className="text-xs text-gray-900 mt-1">Précision</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-black mb-4">Menus</Text>

        <View className="gap-3">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-[20px] p-4 flex-row items-center"
            >
              <View className={`w-12 h-12 rounded-full ${item.color} justify-center items-center mr-4`}>
                <Ionicons name={item.icon as any} size={24} color="#000" />
              </View>
              <Text className="flex-1 text-base font-semibold text-black">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity className="bg-white border border-red-200 rounded-[20px] p-4 flex-row items-center justify-center mt-6 mb-8">
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text className="text-base font-bold text-red-500 ml-2">Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
