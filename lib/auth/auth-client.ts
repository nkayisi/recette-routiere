import axios from "axios";
import * as SecureStore from "expo-secure-store";

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

// ==================== CONFIGURATION ====================
const BACKEND_URL = "http://127.0.0.1:8000/api";
const STORAGE_KEYS = {
  ACCESS_TOKEN: "@auth/access_token",
  REFRESH_TOKEN: "@auth/refresh_token",
  USER: "@auth/user",
};

// ==================== AXIOS INSTANCE ====================
export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
// TEMPORAIREMENT DÉSACTIVÉ POUR DEBUG
// api.interceptors.request.use(
//   async (config) => {
//     const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Intercepteur pour gérer le refresh token automatiquement
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Si erreur 401 et pas déjà tenté de refresh
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        
//         if (!refreshToken) {
//           throw new Error("No refresh token");
//         }

//         // Appeler l'endpoint de refresh
//         const response = await axios.post(`${BACKEND_URL}/auth/refresh/`, {
//           refresh: refreshToken,
//         });

//         const newAccessToken = response.data.access;
//         await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

//         // Réessayer la requête originale avec le nouveau token
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Si le refresh échoue, déconnecter l'utilisateur
//         await authService.signOut();
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// ==================== SERVICE D'AUTHENTIFICATION ====================
export const authService = {
  /**
   * Connexion avec email/téléphone et mot de passe
   */
  async signIn(login: string, password: string): Promise<AuthSession> {
    // try {
      console.log("login ========= : ", login);
      console.log("password ========= : ", password);
      
      const response = await api.post("/auth/login", {
        login,
        password,
      });

      console.log("response ========= : ", response.data);
      const { access, refresh, user } = response.data;

      // Stocker les tokens et l'utilisateur de manière sécurisée
      // await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access);
      // await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      // await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));

      return {
        user,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
      };
    // } catch (error: any) {
    //   console.error("Login error:", error.response?.data || error.message);
    //   throw new Error(
    //     error.response?.data?.detail || 
    //     error.response?.data?.message ||
    //     "Identifiants incorrects ou serveur indisponible"
    //   );
    // }
  },

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      // Optionnel : appeler l'endpoint de logout du backend
      if (refreshToken) {
        await api.post("/auth/logout/", { refresh: refreshToken }).catch(() => {
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

    const response = await api.post<{ access: string }>("/auth/refresh/", {
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
