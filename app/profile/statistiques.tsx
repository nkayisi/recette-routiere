import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

// Types pour les statistiques
interface Statistics {
  perceptions: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  verifications: {
    total: number;
    today: number;
    week: number;
  };
  revenue: {
    total: string;
    today: string;
    week: string;
    month: string;
  };
  byType: {
    peage: number;
    taxe_routiere: number;
  };
  byVehicle: {
    moto: number;
    vehicule: number;
  };
}

export default function StatistiquesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  // TODO: Remplacer par l'API réelle
  const fetchStatistics = async (): Promise<Statistics> => {
    // Simulation de données
    return {
      perceptions: {
        total: 1247,
        today: 23,
        week: 156,
        month: 678,
      },
      verifications: {
        total: 892,
        today: 15,
        week: 98,
      },
      revenue: {
        total: "12450000",
        today: "345000",
        week: "2340000",
        month: "8900000",
      },
      byType: {
        peage: 834,
        taxe_routiere: 413,
      },
      byVehicle: {
        moto: 567,
        vehicule: 680,
      },
    };
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics", user?.agent_id],
    queryFn: fetchStatistics,
    enabled: !!user?.agent_id,
  });

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")} FC`;
  };

  const getPeriodData = () => {
    if (!stats) return { perceptions: 0, revenue: "0" };
    
    switch (period) {
      case "today":
        return { perceptions: stats.perceptions.today, revenue: stats.revenue.today };
      case "week":
        return { perceptions: stats.perceptions.week, revenue: stats.revenue.week };
      case "month":
        return { perceptions: stats.perceptions.month, revenue: stats.revenue.month };
      default:
        return { perceptions: 0, revenue: "0" };
    }
  };

  const StatCard = ({ icon, label, value, color, subtitle }: any) => (
    <View className={`${color} rounded-2xl p-4 mb-3`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-12 h-12 rounded-full bg-white/50 justify-center items-center">
          <Ionicons name={icon} size={24} color="#000" />
        </View>
        <Text className="text-3xl font-bold text-black">{value}</Text>
      </View>
      <Text className="text-sm font-semibold text-black">{label}</Text>
      {subtitle && <Text className="text-xs text-gray-600 mt-1">{subtitle}</Text>}
    </View>
  );

  const ChartBar = ({ label, value, maxValue, color }: any) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-semibold text-black">{label}</Text>
          <Text className="text-sm font-bold text-black">{value}</Text>
        </View>
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className={`h-full ${color} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-gray-500 mt-4">Chargement des statistiques...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const periodData = getPeriodData();

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5]" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Mes statistiques</Text>
        </View>

        {/* Sélecteur de période */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { id: "today", label: "Aujourd'hui" },
            { id: "week", label: "Cette semaine" },
            { id: "month", label: "Ce mois" },
          ].map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setPeriod(p.id as any)}
              className={`px-4 py-2 rounded-full ${
                period === p.id ? "bg-black" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  period === p.id ? "text-white" : "text-black"
                }`}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
        {/* Résumé de la période */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">
            Résumé {period === "today" ? "du jour" : period === "week" ? "de la semaine" : "du mois"}
          </Text>
          
          <View className="bg-black rounded-2xl p-5 mb-3">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-base font-semibold">Revenus collectés</Text>
              <Ionicons name="trending-up" size={24} color="#fff" />
            </View>
            <Text className="text-white text-4xl font-bold">
              {formatAmount(periodData.revenue)}
            </Text>
            <Text className="text-white/70 text-sm mt-2">
              {periodData.perceptions} perceptions effectuées
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-card-blue rounded-2xl p-4">
              <Ionicons name="document-text-outline" size={24} color="#000" />
              <Text className="text-2xl font-bold text-black mt-2">
                {periodData.perceptions}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Perceptions</Text>
            </View>
            
            <View className="flex-1 bg-card-green rounded-2xl p-4">
              <Ionicons name="checkmark-done-outline" size={24} color="#000" />
              <Text className="text-2xl font-bold text-black mt-2">
                {period === "today" ? stats?.verifications.today : stats?.verifications.week}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">Vérifications</Text>
            </View>
          </View>
        </View>

        {/* Statistiques globales */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Statistiques globales</Text>
          
          <StatCard
            icon="document-text"
            label="Total des perceptions"
            value={stats?.perceptions.total}
            color="bg-card-blue"
            subtitle="Depuis le début"
          />
          
          <StatCard
            icon="checkmark-done"
            label="Total des vérifications"
            value={stats?.verifications.total}
            color="bg-card-green"
            subtitle="Depuis le début"
          />
          
          <View className="bg-card-yellow rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-12 h-12 rounded-full bg-white/50 justify-center items-center">
                <Ionicons name="cash" size={24} color="#000" />
              </View>
              <Text className="text-2xl font-bold text-black">
                {formatAmount(stats?.revenue.total || "0")}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-black">Revenus totaux collectés</Text>
            <Text className="text-xs text-gray-600 mt-1">Depuis le début</Text>
          </View>
        </View>

        {/* Répartition par type */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Répartition par type</Text>
          
          <View className="bg-white rounded-2xl p-4">
            <ChartBar
              label="Péage"
              value={stats?.byType.peage}
              maxValue={stats?.perceptions.total || 1}
              color="bg-blue-500"
            />
            <ChartBar
              label="Taxe routière"
              value={stats?.byType.taxe_routiere}
              maxValue={stats?.perceptions.total || 1}
              color="bg-green-500"
            />
          </View>
        </View>

        {/* Répartition par véhicule */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Répartition par véhicule</Text>
          
          <View className="bg-white rounded-2xl p-4">
            <ChartBar
              label="Motos"
              value={stats?.byVehicle.moto}
              maxValue={stats?.perceptions.total || 1}
              color="bg-purple-500"
            />
            <ChartBar
              label="Véhicules"
              value={stats?.byVehicle.vehicule}
              maxValue={stats?.perceptions.total || 1}
              color="bg-orange-500"
            />
          </View>
        </View>

        {/* Performance */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-black mb-4">Performance</Text>
          
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-gray-600">Moyenne par jour</Text>
              <Text className="text-lg font-bold text-black">
                {Math.round((stats?.perceptions.month || 0) / 30)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-gray-600">Moyenne par semaine</Text>
              <Text className="text-lg font-bold text-black">
                {Math.round((stats?.perceptions.month || 0) / 4)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Taux de vérification</Text>
              <Text className="text-lg font-bold text-black">
                {stats?.perceptions.total && stats?.verifications.total
                  ? Math.round((stats.verifications.total / stats.perceptions.total) * 100)
                  : 0}
                %
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
