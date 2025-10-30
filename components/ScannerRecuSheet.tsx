import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMutation } from "@tanstack/react-query";
import { verifyRecuByNumero, type Perception, type VerifyRecuResult } from "@/lib/api/perception.api";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ScannerRecuSheet({ visible, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyRecuResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  // Demander la permission dès l'ouverture du modal
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  // Réinitialiser l'état quand le modal se ferme
  useEffect(() => {
    if (!visible) {
      setScannedCode(null);
      setVerifyResult(null);
      setScanError(null);
      setHasScanned(false);
    }
  }, [visible]);

  // Mutation pour vérifier le reçu
  const verifyMutation = useMutation({
    mutationFn: (numero: string) => verifyRecuByNumero(numero),
    onSuccess: (result: VerifyRecuResult) => {
      setVerifyResult(result);
      setScanError(null);
    },
    onError: (error: Error) => {
      setScanError(error.message);
      setVerifyResult(null);
    },
  });

  const handleClose = () => {
    setScannedCode(null);
    setVerifyResult(null);
    setScanError(null);
    setHasScanned(false);
    onClose();
  };

  const handleScanNow = () => {
    if (!scannedCode) return;
    
    setScanError(null);
    setVerifyResult(null);
    verifyMutation.mutate(scannedCode);
  };

  const handleScanAnother = () => {
    setScannedCode(null);
    setVerifyResult(null);
    setScanError(null);
    setHasScanned(false);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (hasScanned) return;
    
    setHasScanned(true);
    setScannedCode(data);
    console.log("📷 QR Code scanné:", data);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")} FC`;
  };

  // Si pas de permission, afficher un message
  if (!permission?.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[24px] h-[50%] px-5 pt-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-black">Scanner un Reçu</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center">
              <Ionicons name="camera-outline" size={64} color="#9ca3af" />
              <Text className="text-lg font-semibold text-black mt-4 text-center">
                Permission caméra requise
              </Text>
              <Text className="text-base text-gray-600 mt-2 text-center px-8">
                Veuillez autoriser l'accès à la caméra pour scanner les QR codes
              </Text>
              <TouchableOpacity
                onPress={requestPermission}
                className="mt-6 bg-black rounded-full px-6 py-3"
              >
                <Text className="text-white font-semibold">Autoriser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Affichage des détails du reçu (cas found ou already_checked)
  if (verifyResult && verifyResult.recette && (verifyResult.status === "found" || verifyResult.status === "already_checked")) {
    const scannedRecu = verifyResult.recette;
    const typeLabel = scannedRecu.type_recette === "peage" ? "Péage" : "Taxe routière";
    const typeEnginLabel = scannedRecu.type_engin === "moto" ? "Moto" : "Véhicule";

    return (
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[24px] h-[85%]">
            {/* Header */}
            <View className="px-5 pt-6 pb-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-black">Reçu Vérifié</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
              {/* Message de succès ou d'avertissement */}
              {verifyResult.status === "found" ? (
                <View className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-green-500 justify-center items-center">
                      <Ionicons name="checkmark" size={28} color="#fff" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-green-800">Reçu valide !</Text>
                      <Text className="text-sm text-green-700 mt-1">
                        {verifyResult.message || "Ce reçu est enregistré dans notre système"}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-blue-500 justify-center items-center">
                      <Ionicons name="information-circle" size={28} color="#fff" />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-blue-800">Déjà vérifié à ce poste</Text>
                      <Text className="text-sm text-blue-700 mt-1">
                        {verifyResult.message || "Ce reçu a déjà été vérifié à ce poste"}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Détails du reçu */}
              <View className="mt-5 bg-white border-[1px] border-gray-200 rounded-2xl p-5">
                <Text className="text-lg font-bold text-black mb-4">Informations du reçu</Text>

                {/* Numéro */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Numéro de reçu</Text>
                  <Text className="text-base font-semibold text-black">{scannedRecu.numero}</Text>
                </View>

                {/* Type */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Type de perception</Text>
                  <Text className="text-base font-semibold text-black">{typeLabel}</Text>
                </View>

                {/* Montant */}
                <View className="mb-4 bg-gray-50 rounded-xl p-4">
                  <Text className="text-xs text-gray-500 mb-1">Montant</Text>
                  <Text className="text-2xl font-bold text-black">
                    {formatAmount(scannedRecu.montant)}
                  </Text>
                </View>

                {/* Immatriculation */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Immatriculation</Text>
                  <Text className="text-base font-semibold text-black">
                    {scannedRecu.immatriculation}
                  </Text>
                </View>

                {/* Type d'engin */}
                {scannedRecu.type_engin && (
                  <View className="mb-4">
                    <Text className="text-xs text-gray-500 mb-1">Type d'engin</Text>
                    <Text className="text-base font-semibold text-black">
                      {typeEnginLabel}
                      {scannedRecu.categorie_engin
                        ? ` - ${scannedRecu.categorie_engin.charAt(0).toUpperCase() + scannedRecu.categorie_engin.slice(1)}`
                        : ""}
                    </Text>
                  </View>
                )}

                {/* Date */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Date de création</Text>
                  <Text className="text-base font-semibold text-black">
                    {formatDate(scannedRecu.created_at)}
                  </Text>
                </View>

                {/* Poste */}
                <View className="mb-4">
                  <Text className="text-xs text-gray-500 mb-1">Poste de perception</Text>
                  <Text className="text-base font-semibold text-black">
                    {scannedRecu.poste.nom}
                  </Text>
                </View>

                {/* Vérifications */}
                <View className="pt-4 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {scannedRecu.checkings_count} vérification{scannedRecu.checkings_count > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bouton Scanner un autre */}
              <TouchableOpacity
                onPress={handleScanAnother}
                className="mt-5 mb-6 bg-black rounded-full py-4"
              >
                <View className="flex-row justify-center items-center gap-2">
                  <Ionicons name="scan-outline" size={24} color="#fff" />
                  <Text className="text-white text-center font-bold text-lg">
                    Scanner un autre reçu
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // Interface principale avec caméra
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 px-5 pt-[60px] pb-4 bg-black/50">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-white">Scanner un Reçu</Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Caméra */}
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Overlay de scan */}
          <View className="flex-1 justify-center items-center">
            <View className="w-64 h-64 border-4 border-white rounded-2xl" />
            <Text className="text-white text-center mt-8 text-base px-8">
              {scannedCode ? "QR Code détecté !" : "Positionnez le QR code dans le cadre"}
            </Text>
          </View>
        </CameraView>

        {/* Zone de résultat en bas */}
        {(scannedCode || scanError || verifyResult) && (
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] px-5 pt-6 pb-8">
            {/* Code scanné - Bouton Scanner maintenant */}
            {scannedCode && !scanError && !verifyMutation.isPending && !verifyResult && (
              <View>
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-full bg-green-100 justify-center items-center">
                    <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-bold text-black">QR Code détecté</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      No. du reçu : {scannedCode}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleScanNow}
                  className="bg-black rounded-full py-4 mb-3"
                >
                  <View className="flex-row justify-center items-center gap-2">
                    <Ionicons name="search" size={24} color="#fff" />
                    <Text className="text-white text-center font-bold text-lg">
                      Vérifier le numéro du reçu
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleScanAnother}
                  className="bg-gray-100 rounded-full py-3"
                >
                  <Text className="text-black text-center font-semibold">
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Chargement */}
            {verifyMutation.isPending && (
              <View className="items-center py-6">
                <ActivityIndicator size="large" color="#000" />
                <Text className="text-black mt-4 text-base font-semibold">
                  Vérification du reçu...
                </Text>
              </View>
            )}

            {/* Erreur / Avertissement - Reçu introuvable */}
            {(scanError || (verifyResult && verifyResult.status === "not_found")) && (
              <View>
                {(verifyResult?.status === "not_found" || scanError?.includes("introuvable")) ? (
                  // Avertissement pour reçu introuvable (potentiel faux)
                  <>
                    <View className="flex-row items-start mb-4">
                      <View className="w-12 h-12 rounded-full bg-orange-100 justify-center items-center">
                        <Ionicons name="warning" size={28} color="#f97316" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold text-orange-600">Reçu introuvable</Text>
                        <Text className="text-sm text-gray-700 mt-1">
                          Ce numéro de reçu n'existe pas dans notre système. Il s'agit probablement d'un faux reçu.
                        </Text>
                      </View>
                    </View>

                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="alert-circle" size={20} color="#f97316" />
                        <Text className="text-sm font-semibold text-orange-800 ml-2">
                          Attention
                        </Text>
                      </View>
                      <Text className="text-xs text-orange-700">
                        Ce reçu pourrait être contrefait. Veuillez signaler cette tentative aux autorités compétentes.
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleScanAnother}
                      className="bg-black rounded-full py-4"
                    >
                      <View className="flex-row justify-center items-center gap-2">
                        <Ionicons name="scan-outline" size={24} color="#fff" />
                        <Text className="text-white text-center font-bold text-lg">
                          Scanner un autre reçu
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Erreur technique (réseau, serveur, etc.)
                  <>
                    <View className="flex-row items-center mb-4">
                      <View className="w-12 h-12 rounded-full bg-red-100 justify-center items-center">
                        <Ionicons name="close-circle" size={28} color="#ef4444" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-lg font-bold text-red-600">Erreur</Text>
                        <Text className="text-sm text-gray-700 mt-1">{scanError}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleScanAnother}
                      className="bg-black rounded-full py-4"
                    >
                      <View className="flex-row justify-center items-center gap-2">
                        <Ionicons name="scan-outline" size={24} color="#fff" />
                        <Text className="text-white text-center font-bold text-lg">
                          Réessayer
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
