import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";

interface Notification {
  id: number;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ visible, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "success",
      title: "Perception enregistrée",
      message: "La perception #12345 a été enregistrée avec succès",
      time: "Il y a 5 min",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Quota journalier atteint",
      message: "Vous avez atteint 80% de votre quota journalier",
      time: "Il y a 1h",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Mise à jour disponible",
      message: "Une nouvelle version de l'application est disponible",
      time: "Il y a 2h",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Reçu imprimé",
      message: "Le reçu #67890 a été imprimé avec succès",
      time: "Hier",
      read: true,
    },
    {
      id: 5,
      type: "error",
      title: "Erreur de synchronisation",
      message: "Impossible de synchroniser les données. Vérifiez votre connexion",
      time: "Hier",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIconName = (type: string) => {
    switch (type) {
      case "success": return "checkmark-circle";
      case "warning": return "warning";
      case "info": return "information-circle";
      case "error": return "close-circle";
      default: return "notifications";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "#10b981";
      case "warning": return "#f59e0b";
      case "info": return "#3b82f6";
      case "error": return "#ef4444";
      default: return "#000";
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-50";
      case "warning": return "bg-yellow-50";
      case "info": return "bg-blue-50";
      case "error": return "bg-red-50";
      default: return "bg-gray-50";
    }
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
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              
              <Text className="text-2xl font-bold text-black">Notifications</Text>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text className="text-sm font-semibold text-blue-600">
                  Tout marquer lu
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {unreadCount > 0 && (
            <Text className="text-sm text-gray-500 ml-[52px]">
              {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Liste des notifications */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mb-4">
                <Ionicons name="notifications-off-outline" size={40} color="#999" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Aucune notification
              </Text>
              <Text className="text-sm text-gray-500 text-center px-8">
                Vous n'avez aucune notification pour le moment
              </Text>
            </View>
          ) : (
            <View className="px-5 py-4">
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`mb-3 rounded-2xl p-4 ${getBgColor(notification.type)} ${
                    !notification.read ? "border-2 border-gray-300" : "border border-gray-200"
                  }`}
                  onPress={() => markAsRead(notification.id)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    {/* Icône */}
                    <View className="w-10 h-10 rounded-full bg-white justify-center items-center mt-1">
                      <Ionicons 
                        name={getIconName(notification.type) as any} 
                        size={24} 
                        color={getIconColor(notification.type)} 
                      />
                    </View>

                    {/* Contenu */}
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between mb-1">
                        <Text className={`text-base font-bold text-black flex-1 ${
                          !notification.read ? "" : "opacity-70"
                        }`}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View className="w-2 h-2 rounded-full bg-blue-600 ml-2 mt-2" />
                        )}
                      </View>
                      
                      <Text className={`text-sm text-gray-700 mb-2 ${
                        !notification.read ? "" : "opacity-70"
                      }`}>
                        {notification.message}
                      </Text>
                      
                      <Text className="text-xs text-gray-500">
                        {notification.time}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer avec bouton d'action */}
        {notifications.length > 0 && (
          <View className="px-5 py-4 border-t border-gray-200">
            <TouchableOpacity 
              className="bg-gray-100 rounded-full py-4"
              onPress={() => setNotifications([])}
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                Effacer toutes les notifications
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
