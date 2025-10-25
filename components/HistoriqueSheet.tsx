import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function HistoriqueSheet({ visible, onClose }: Props) {
  const handleClose = () => {
    onClose();
  };

  const perceptions = [
    { id: 1, type: "Taxe routière", montant: "5000 FC", plaque: "CD-12345", date: "Aujourd'hui, 14:30", statut: "Validé" },
    { id: 2, type: "Péage", montant: "2000 FC", plaque: "CD-67890", date: "Hier, 09:15", statut: "Validé" },
    { id: 3, type: "Taxe routière", montant: "5000 FC", plaque: "CD-11111", date: "Il y a 2 jours", statut: "En attente" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[24px] h-[80%] px-5 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-black">Historique Rapide</Text>
            <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity className="bg-black rounded-full px-4 py-2">
              <Text className="text-white font-semibold">Toutes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-[#e5e5e5] rounded-full px-4 py-2">
              <Text className="text-black font-semibold">Aujourd'hui</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-[#e5e5e5] rounded-full px-4 py-2">
              <Text className="text-black font-semibold">Cette semaine</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {perceptions.map((item) => (
              <TouchableOpacity key={item.id} className="bg-white border border-[#e5e5e5] rounded-2xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-black mb-1">{item.type}</Text>
                    <Text className="text-sm text-gray-600">Plaque: {item.plaque}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${item.statut === "Validé" ? "bg-card-green" : "bg-card-yellow"}`}>
                    <Text className="text-xs font-semibold">{item.statut}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-xl font-bold text-black">{item.montant}</Text>
                  <Text className="text-sm text-gray-500">{item.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
