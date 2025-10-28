import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { api } from "./auth-client";

/**
 * Hook pour gérer l'expiration de session automatiquement
 * 
 * Ce hook écoute les erreurs d'API et redirige vers la page de connexion
 * quand le refresh token est blacklisté/expiré
 * 
 * @example
 * ```typescript
 * // Dans votre layout principal ou App.tsx
 * function RootLayout() {
 *   useSessionExpiration();
 *   return <Stack />;
 * }
 * ```
 */
export function useSessionExpiration() {
  const router = useRouter();
  const hasShownAlert = useRef(false);

  useEffect(() => {
    // Réinitialiser le flag quand le composant est monté
    hasShownAlert.current = false;

    // Intercepteur pour détecter les erreurs de session expirée
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Vérifier si c'est une erreur de session expirée
        if (error?.isSessionExpired || error?.message === "SESSION_EXPIRED") {
          // Afficher l'alerte une seule fois
          if (!hasShownAlert.current) {
            hasShownAlert.current = true;
            
            // Afficher un message à l'utilisateur
            Alert.alert(
              "Session expirée",
              "Votre session a expiré. Veuillez vous reconnecter.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    // Rediriger vers la page de connexion
                    router.replace("/login");
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            // Si l'alerte a déjà été affichée, juste rediriger
            router.replace("/login");
          }
        }

        // Rejeter l'erreur pour que les autres intercepteurs puissent la traiter
        return Promise.reject(error);
      }
    );

    // Nettoyer l'intercepteur quand le composant est démonté
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [router]);
}
