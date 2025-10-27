/**
 * Configuration de l'authentification
 * Centralisez ici tous les paramètres liés à l'authentification
 */

// Détection de l'environnement
const isDevelopment = __DEV__;

/**
 * URL du backend selon l'environnement
 */
export const getBackendURL = (): string => {
  if (isDevelopment) {
    // En développement, utilisez l'une de ces options selon votre setup :
    
    // Option 1 : Localhost (iOS Simulator)
    return "http://172.20.10.2:8000/api";
    
    // Option 2 : Émulateur Android
    // return "http://10.0.2.2:8000/api";
    
    // Option 3 : Réseau local (appareil physique ou émulateur sur même réseau)
    // return "http://192.168.1.14:8000/api";
  } else {
    // En production, utilisez l'URL de votre serveur
    return "https://api.recette-routiere.cd/api";
  }
};

/**
 * Configuration des endpoints
 * Note: Vérifiez les URLs dans votre backend Django
 */
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login/",           // Sans slash final selon votre Django
  REFRESH: "/auth/token/refresh/", // Selon votre Django
  LOGOUT: "/auth/logout/",
  REGISTER: "/auth/register/",
  VERIFY_OTP: "/auth/verify-otp/",
  RESEND_OTP: "/auth/resend-otp/",
  FORGOT_PASSWORD: "/auth/forgot-password/",
  RESET_PASSWORD: "/auth/reset-password/",
} as const;

/**
 * Clés de stockage SecureStore
 * Note: SecureStore n'accepte que les caractères alphanumériques, ".", "-", et "_"
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER: "auth_user",
} as const;

/**
 * Configuration des timeouts
 */
export const TIMEOUTS = {
  REQUEST: 30000, // 30 secondes
  REFRESH: 10000, // 10 secondes
} as const;

/**
 * Messages d'erreur personnalisés
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
  INVALID_CREDENTIALS: "Numéro de téléphone ou mot de passe incorrect.",
  SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
  SERVER_ERROR: "Le serveur rencontre un problème. Veuillez réessayer plus tard.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite.",
} as const;

/**
 * Validation
 */
export const VALIDATION = {
  PHONE_LENGTH: 9, // Sans l'indicatif +243
  MIN_PASSWORD_LENGTH: 6,
  PHONE_PREFIX: "+243",
} as const;
