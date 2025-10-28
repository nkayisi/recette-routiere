import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getBackendURL, STORAGE_KEYS as IMPORTED_STORAGE_KEYS, AUTH_ENDPOINTS, TIMEOUTS } from "./config";

// Fallback pour STORAGE_KEYS au cas où l'import échoue
const STORAGE_KEYS = IMPORTED_STORAGE_KEYS || {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER: "auth_user",
};

// ==================== TYPES ====================
export interface DjangoUser {
  id: number;
  email: string;
  username?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  agent_id?: number;
  nom_poste?: string;
}

export interface DjangoLoginResponse {
  access: string;
  refresh: string;
  user: DjangoUser;
}

export interface AuthSession {
  user: DjangoUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ==================== AXIOS INSTANCE ====================
export const api = axios.create({
  baseURL: getBackendURL(),
  timeout: TIMEOUTS.REQUEST,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading token from SecureStore:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables pour éviter les appels multiples
let isRefreshing = false;
let isSessionExpired = false; // Flag pour éviter de traiter plusieurs fois l'expiration
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour gérer le refresh token automatiquement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si la session a déjà expiré, rejeter immédiatement
    if (isSessionExpired) {
      const sessionExpiredError = new Error("SESSION_EXPIRED");
      (sessionExpiredError as any).isSessionExpired = true;
      return Promise.reject(sessionExpiredError);
    }

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Appeler l'endpoint de refresh
        const response = await axios.post(
          `${getBackendURL()}${AUTH_ENDPOINTS.REFRESH}`,
          { refresh: refreshToken },
          { timeout: TIMEOUTS.REFRESH }
        );

        const newAccessToken = response.data.access;
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // Traiter la file d'attente
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Traiter la file d'attente avec l'erreur
        processQueue(refreshError, null);
        isRefreshing = false;

        // Détecter si le refresh token est blacklisté/expiré
        // Seulement si c'est une réponse du serveur (pas une erreur réseau)
        const isTokenBlacklisted = 
          refreshError.response && (
            (refreshError.response.status === 401 && 
             (refreshError.response.data?.code === "token_not_valid" ||
              refreshError.response.data?.detail?.toLowerCase().includes("blacklist") ||
              refreshError.response.data?.detail?.toLowerCase().includes("invalid") ||
              refreshError.response.data?.detail?.toLowerCase().includes("expired"))) ||
            // Ou si le message d'erreur contient ces mots-clés
            (refreshError.response.data?.detail && 
             typeof refreshError.response.data.detail === "string" &&
             (refreshError.response.data.detail.includes("Token is blacklisted") ||
              refreshError.response.data.detail.includes("Token is invalid or expired")))
          );

        if (isTokenBlacklisted) {
          console.log("🔒 Refresh token blacklisté ou expiré - Déconnexion automatique");
          
          // Marquer la session comme expirée pour éviter les tentatives futures
          isSessionExpired = true;
          
          // Nettoyer le storage directement SANS appeler l'API de logout
          // pour éviter une boucle infinie
          try {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
          } catch (cleanupError) {
            console.error("Erreur lors du nettoyage du storage:", cleanupError);
          }
          
          // Créer une erreur personnalisée pour informer l'UI
          const sessionExpiredError = new Error("SESSION_EXPIRED");
          (sessionExpiredError as any).isSessionExpired = true;
          return Promise.reject(sessionExpiredError);
        }

        // Si autre erreur de refresh (réseau, serveur, etc.), 
        // NE PAS nettoyer le storage - juste rejeter l'erreur
        // L'utilisateur peut réessayer plus tard
        console.warn("⚠️ Erreur lors du refresh token (non-critique):", refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== SERVICE D'AUTHENTIFICATION ====================
export const authService = {
  /**
   * Connexion avec email/téléphone et mot de passe
   */
  async signIn(login: string, password: string): Promise<AuthSession> {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        login,
        password,
      });

      const { access, refresh, user } = response.data;

      // Stocker les tokens et l'utilisateur de manière sécurisée
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

      // Réinitialiser le flag de session expirée
      isSessionExpired = false;

      return {
        user,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
      };
    } catch (error: any) {
      // console.error("Login error:", error);
      
      // Gestion d'erreurs spécifiques
      if (error.response) {
        // Erreur de réponse du serveur
        const data = error.response.data;
        
        // Extraire le message d'erreur selon différents formats possibles
        let errorMessage = "Identifiants incorrects";
        
        if (typeof data === 'string') {
          // Si la réponse est une chaîne (HTML par exemple)
          if (data.includes('Page not found') || data.includes('404')) {
            errorMessage = "Endpoint non trouvé. Vérifiez la configuration du backend.";
          } else {
            errorMessage = "Erreur serveur";
          }
        } else if (typeof data === 'object') {
          // Si la réponse est un objet JSON
          errorMessage = 
            data?.detail || 
            data?.message ||
            data?.error ||
            data?.non_field_errors?.[0] ||
            (data?.login && `Login: ${data.login[0]}`) ||
            (data?.password && `Password: ${data.password[0]}`) ||
            "Identifiants incorrects";
        }
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // Pas de réponse du serveur
        throw new Error("Serveur indisponible. Vérifiez votre connexion.");
      } else {
        // Autre erreur
        throw new Error(error.message || "Une erreur est survenue lors de la connexion.");
      }
    }
  },

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      // Optionnel : appeler l'endpoint de logout du backend
      if (refreshToken) {
        await api.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshToken }).catch(() => {
          // Ignorer les erreurs de logout backend
        });
      }
    } finally {
      // Toujours nettoyer le storage local
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
    }
  },

  /**
   * Récupérer la session actuelle
   * La session est considérée valide si le REFRESH TOKEN existe
   * L'access token peut être expiré, il sera rafraîchi automatiquement
   */
  async getSession(): Promise<AuthSession> {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      // La session est valide SI le refresh token existe
      // L'access token et l'utilisateur sont optionnels (peuvent être rafraîchis)
      if (!refreshToken) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        };
      }

      // Si l'utilisateur n'est pas en cache, on considère quand même la session valide
      // car le refresh token existe
      const user = userJson ? JSON.parse(userJson) as DjangoUser : null;

      return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true, // Basé uniquement sur la présence du refresh token
      };
    } catch (error) {
      console.error("Get session error:", error);
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      };
    }
  },

  /**
   * Rafraîchir le token manuellement
   */
  async refreshToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<{ access: string }>(AUTH_ENDPOINTS.REFRESH, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

    return newAccessToken;
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session.isAuthenticated;
  },

  /**
   * Valider la session actuelle en testant le refresh token
   * Utile au démarrage de l'app pour vérifier si la session est toujours valide
   * Cette fonction se base UNIQUEMENT sur le refresh token
   * 
   * @returns true si la session est valide (refresh token valide), false sinon
   */
  async validateSession(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        console.log("❌ Pas de refresh token - Session invalide");
        return false;
      }

      console.log("🔄 Validation de la session avec le refresh token...");

      // Tester le refresh token en appelant l'endpoint de refresh
      const response = await axios.post(
        `${getBackendURL()}${AUTH_ENDPOINTS.REFRESH}`,
        { refresh: refreshToken },
        { timeout: TIMEOUTS.REFRESH }
      );

      // Si le refresh fonctionne, mettre à jour l'access token
      const newAccessToken = response.data.access;
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

      console.log("✅ Session valide - Access token rafraîchi");
      
      // Réinitialiser le flag de session expirée
      isSessionExpired = false;

      return true;
    } catch (error: any) {
      console.error("❌ Erreur lors de la validation de session:", error.message);
      
      // Si le refresh échoue (token blacklisté/expiré), nettoyer la session
      const isTokenInvalid = 
        error.response?.status === 401 ||
        error.response?.data?.code === "token_not_valid" ||
        error.response?.data?.detail?.includes("blacklisted") ||
        error.response?.data?.detail?.includes("expired");

      if (isTokenInvalid) {
        console.log("🔒 Refresh token invalide/expiré - Nettoyage du storage");
        await this.signOut();
      } else {
        console.warn("⚠️ Erreur réseau lors de la validation - Session conservée");
      }

      return false;
    }
  },
};
