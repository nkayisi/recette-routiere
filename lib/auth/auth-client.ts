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

// Intercepteur pour gérer le refresh token automatiquement
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Appeler l'endpoint de refresh
        const response = await axios.post(`${getBackendURL()}${AUTH_ENDPOINTS.REFRESH}`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        await authService.signOut();
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
   */
  async getSession(): Promise<AuthSession> {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      if (!accessToken || !refreshToken || !userJson) {
        return {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        };
      }

      const user = JSON.parse(userJson) as DjangoUser;

      return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
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
};
