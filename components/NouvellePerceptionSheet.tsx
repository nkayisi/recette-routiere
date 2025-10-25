import { Ionicons } from "@expo/vector-icons";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NouvellePerceptionSheet({ visible, onClose }: Props) {
  const [typePerception, setTypePerception] = useState<"taxe" | "peage" | null>("peage");
  const [vehiculeType, setVehiculeType] = useState<"moto" | "vehicule" | null>(null);
  const [categorie, setCategorie] = useState<string>("");
  const [poids, setPoids] = useState<string>("");
  const [cylindree, setCylindree] = useState<string>("");
  const [usage, setUsage] = useState<string>("");

  // Fonction pour réinitialiser tous les champs
  const resetForm = () => {
    setTypePerception("peage");
    setVehiculeType(null);
    setCategorie("");
    setPoids("");
    setCylindree("");
    setUsage("");
  };

  // Fonction pour fermer et réinitialiser
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calcul automatique du prix pour le péage
  const calculatePeagePrice = () => {
    if (typePerception !== "peage" || !vehiculeType || !categorie) return "";
    
    const prices: { [key: string]: number } = {
      "moto-standard": 500,
      "vehicule-leger": 1000,
      "vehicule-moyen": 2000,
      "vehicule-lourd": 3500,
      "vehicule-transport": 5000,
    };
    
    const key = `${vehiculeType}-${categorie}`;
    return prices[key] ? `${prices[key]} FC` : "";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[24px] h-[85%]">
          <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Nouvelle Perception</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Type de perception */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Type de perception</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                  className={`flex-1 border border-[#e5e5e5] rounded-xl p-4 ${typePerception === "peage" ? "bg-card-blue" : "bg-white"}`}
                  onPress={() => {
                    setTypePerception("peage");
                    setCategorie("");
                    setPoids("");
                    setCylindree("");
                    setUsage("");
                  }}
                >
                  <Text className="text-center font-semibold">Péage</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 border border-[#e5e5e5] rounded-xl p-4 ${typePerception === "taxe" ? "bg-card-blue" : "bg-white"}`}
                  onPress={() => {
                    setTypePerception("taxe");
                    setVehiculeType(null);
                    setCategorie("");
                  }}
                >
                  <Text className="text-center font-semibold">Taxe routière</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Champs pour TAXE ROUTIÈRE */}
            {typePerception === "taxe" && (
              <>
                {/* Poids */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Poids du véhicule (kg)</Text>
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Ex: 1500"
                    keyboardType="numeric"
                    value={poids}
                    onChangeText={setPoids}
                  />
                </View>

                {/* Cylindrée */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Cylindrée (cm³)</Text>
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Ex: 1600"
                    keyboardType="numeric"
                    value={cylindree}
                    onChangeText={setCylindree}
                  />
                </View>

                {/* Usage du véhicule */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Usage du véhicule</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"].map((u) => (
                      <TouchableOpacity
                        key={u}
                        className={`px-5 py-3 rounded-xl border ${usage === u ? "bg-card-yellow border-yellow-400" : "bg-white border-[#e5e5e5]"}`}
                        onPress={() => setUsage(u)}
                      >
                        <Text className="font-semibold">{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Montant pour taxe */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Montant (FC)</Text>
                  <TextInput
                    className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                    placeholder="Entrer le montant"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {/* Champs pour PÉAGE */}
            {typePerception === "peage" && (
              <>
                {/* Type de véhicule */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Type de véhicule</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className={`flex-1 border rounded-xl p-4 ${vehiculeType === "moto" ? "bg-card-blue border-blue-400" : "bg-white border-[#e5e5e5]"}`}
                      onPress={() => {
                        setVehiculeType("moto");
                        setCategorie("standard");
                      }}
                    >
                      <View className="items-center">
                        <Ionicons name="bicycle" size={24} color="#000" />
                        <Text className="font-semibold mt-2">Moto</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 border rounded-xl p-4 ${vehiculeType === "vehicule" ? "bg-card-blue border-blue-400" : "bg-white border-[#e5e5e5]"}`}
                      onPress={() => {
                        setVehiculeType("vehicule");
                        setCategorie("");
                      }}
                    >
                      <View className="items-center">
                        <Ionicons name="car" size={24} color="#000" />
                        <Text className="font-semibold mt-2">Véhicule</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Catégorie de véhicule (si véhicule sélectionné) */}
                {vehiculeType === "vehicule" && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Catégorie de véhicule</Text>
                    <View className="gap-2">
                      {[
                        { id: "leger", label: "Léger (< 3.5T)", price: 1000 },
                        { id: "moyen", label: "Moyen (3.5T - 7.5T)", price: 2000 },
                        { id: "lourd", label: "Lourd (> 7.5T)", price: 3500 },
                        { id: "transport", label: "Transport en commun", price: 5000 },
                      ].map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          className={`flex-row justify-between items-center border rounded-xl p-4 ${categorie === cat.id ? "bg-card-green border-green-400" : "bg-white border-[#e5e5e5]"}`}
                          onPress={() => setCategorie(cat.id)}
                        >
                          <Text className="font-semibold">{cat.label}</Text>
                          <Text className="text-gray-600">{cat.price} FC</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Montant calculé automatiquement */}
                {calculatePeagePrice() && (
                  <View className="mb-4 bg-card-green border border-green-300 rounded-xl p-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-1">Montant du péage</Text>
                    <Text className="text-3xl font-bold text-black">{calculatePeagePrice()}</Text>
                  </View>
                )}
              </>
            )}

            {/* Numéro de plaque */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Numéro de plaque</Text>
              <TextInput
                className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                placeholder="Ex: CD-12345"
                autoCapitalize="characters"
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description (optionnel)</Text>
              <TextInput
                className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-base"
                placeholder="Ajouter une note..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Bouton */}
            <TouchableOpacity className="bg-black justify-center items-center rounded-full py-4 mt-4 mb-6">
              <View className="flex-row items-center gap-2">
                <Ionicons name="print-outline" size={24} color="#fff" />
                <Text className="text-white text-center font-bold text-lg">Imprimer un reçu</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
