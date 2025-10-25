import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ScannerRecuSheet({ visible, onClose }: Props) {
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[24px] h-[70%] px-5 pt-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-black">Scanner un Reçu</Text>
            <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center">
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center">
            <View className="w-32 h-32 bg-card-gray rounded-full justify-center items-center mb-6">
              <Ionicons name="scan-outline" size={64} color="#000" />
            </View>
            <Text className="text-xl font-bold text-black mb-2 text-center">Scanner un reçu</Text>
            <Text className="text-base text-gray-600 mb-8 text-center px-8">
              Utilisez votre caméra pour scanner et enregistrer automatiquement un reçu de perception
            </Text>

            <View className="w-full gap-3">
              <TouchableOpacity className="bg-black rounded-full py-4">
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text className="text-white text-center font-bold text-lg">Ouvrir la caméra</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white border border-[#e5e5e5] rounded-full py-4">
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="images" size={24} color="#000" />
                  <Text className="text-black text-center font-bold text-lg">Choisir depuis la galerie</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
