import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function HelpModal({ visible, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "Tout", icon: "apps" },
    { id: "perception", label: "Perceptions", icon: "document-text" },
    { id: "recu", label: "Reçus", icon: "receipt" },
    { id: "compte", label: "Compte", icon: "person" },
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: "perception",
      question: "Comment créer une nouvelle perception ?",
      answer: "Appuyez sur le bouton 'Nouvelle Perception' sur l'écran d'accueil, choisissez le type (Taxe routière ou Péage), remplissez les informations du véhicule et validez.",
    },
    {
      id: 2,
      category: "perception",
      question: "Quels sont les types de perceptions disponibles ?",
      answer: "Il existe deux types : la Taxe routière (basée sur le poids et la cylindrée) et le Péage (avec des tarifs fixes selon la catégorie du véhicule).",
    },
    {
      id: 3,
      category: "recu",
      question: "Comment imprimer un reçu ?",
      answer: "Après avoir créé une perception, appuyez sur le bouton 'Imprimer un reçu'. Le reçu sera généré et envoyé à l'imprimante connectée.",
    },
    {
      id: 4,
      category: "recu",
      question: "Comment scanner un reçu existant ?",
      answer: "Utilisez le bouton 'Scanner Reçu' sur l'écran d'accueil. Pointez la caméra vers le code QR ou le code-barres du reçu pour le vérifier.",
    },
    {
      id: 5,
      category: "perception",
      question: "Que faire en cas d'erreur lors de la saisie ?",
      answer: "Vous pouvez annuler la perception avant validation. Une fois validée, contactez votre superviseur pour effectuer une correction.",
    },
    {
      id: 6,
      category: "compte",
      question: "Comment consulter mon historique ?",
      answer: "Appuyez sur 'Historique Rapide' pour voir vos dernières perceptions. Vous pouvez filtrer par date et type.",
    },
    {
      id: 7,
      category: "compte",
      question: "Comment signaler une fraude ?",
      answer: "Utilisez le bouton 'Signaler Fraude', choisissez le type d'anomalie, décrivez la situation et ajoutez des photos si nécessaire.",
    },
    {
      id: 8,
      category: "perception",
      question: "Quels sont les tarifs du péage ?",
      answer: "Moto: 500 FC, Véhicule léger: 1000 FC, Véhicule moyen: 2000 FC, Véhicule lourd: 3500 FC, Transport en commun: 5000 FC.",
    },
  ];

  const filteredFAQs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-5 pt-[60px] pb-4 border-b border-gray-200">
          <View className="flex-row items-center gap-3 mb-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-black">Centre d'aide</Text>
          </View>

          {/* Catégories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-4"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`flex-row items-center gap-2 px-4 py-2 mr-2.5 rounded-full ${
                  selectedCategory === category.id 
                    ? "bg-black" 
                    : "bg-gray-100"
                }`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.id ? "#fff" : "#000"} 
                />
                <Text className={`text-sm font-semibold ${
                  selectedCategory === category.id 
                    ? "text-white" 
                    : "text-black"
                }`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contenu */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Section FAQ */}
          <View className="px-5 py-6">
            <Text className="text-lg font-bold text-black mb-4">
              Questions fréquentes
            </Text>

            {filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                className="bg-gray-50 rounded-2xl p-4 mb-3"
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <Text className="flex-1 text-base font-semibold text-black pr-3">
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={expandedId === faq.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#000" 
                  />
                </View>
                
                {expandedId === faq.id && (
                  <Text className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Section Contact */}
          <View className="px-5 pb-6">
            <Text className="text-lg font-bold text-black mb-4">
              Besoin d'aide supplémentaire ?
            </Text>

            <View className="bg-blue-50 rounded-2xl p-5 mb-3">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center">
                  <Ionicons name="call" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-black">Support téléphonique</Text>
                  <Text className="text-sm text-gray-600 mt-1">Lun - Ven, 8h - 17h</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-blue-600 rounded-full py-3">
                <Text className="text-white text-center font-semibold">
                  Appeler le support
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-green-50 rounded-2xl p-5 mb-3">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-full bg-green-100 justify-center items-center">
                  <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-black">WhatsApp</Text>
                  <Text className="text-sm text-gray-600 mt-1">Réponse rapide 24/7</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-green-600 rounded-full py-3">
                <Text className="text-white text-center font-semibold">
                  Contacter sur WhatsApp
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-2xl p-5">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center">
                  <Ionicons name="mail" size={24} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-black">Email</Text>
                  <Text className="text-sm text-gray-600 mt-1">support@recette-routiere.cd</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-gray-700 rounded-full py-3">
                <Text className="text-white text-center font-semibold">
                  Envoyer un email
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Version */}
          <View className="px-5 pb-8">
            <View className="bg-gray-100 rounded-2xl p-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Version de l'application</Text>
                <Text className="text-sm font-bold text-black">1.0.0</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
