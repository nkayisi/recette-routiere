import { VALIDATION } from "./config";

/**
 * Utilitaires de validation pour l'authentification
 */

/**
 * Valide un numéro de téléphone congolais
 * @param phone - Numéro sans l'indicatif +243
 * @returns true si valide
 */
export const validatePhone = (phone: string): boolean => {
  // Doit contenir exactement 9 chiffres
  const phoneRegex = /^\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Valide un mot de passe
 * @param password - Mot de passe à valider
 * @returns true si valide
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

/**
 * Formate un numéro de téléphone avec l'indicatif
 * @param phone - Numéro sans l'indicatif
 * @returns Numéro formaté avec +243
 */
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les espaces et caractères non numériques
  const cleaned = phone.replace(/\D/g, "");
  
  // Ajouter l'indicatif si absent
  if (cleaned.startsWith("243")) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    return `+243${cleaned.substring(1)}`;
  } else {
    return `${VALIDATION.PHONE_PREFIX}${cleaned}`;
  }
};

/**
 * Valide un email
 * @param email - Email à valider
 * @returns true si valide
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Obtient le message d'erreur pour un champ invalide
 */
export const getValidationError = (
  field: "phone" | "password" | "email",
  value: string
): string | null => {
  switch (field) {
    case "phone":
      if (!value) return "Le numéro de téléphone est requis";
      if (!validatePhone(value)) {
        return `Le numéro doit contenir ${VALIDATION.PHONE_LENGTH} chiffres`;
      }
      return null;

    case "password":
      if (!value) return "Le mot de passe est requis";
      if (!validatePassword(value)) {
        return `Le mot de passe doit contenir au moins ${VALIDATION.MIN_PASSWORD_LENGTH} caractères`;
      }
      return null;

    case "email":
      if (!value) return "L'email est requis";
      if (!validateEmail(value)) {
        return "L'email n'est pas valide";
      }
      return null;

    default:
      return null;
  }
};

/**
 * Masque un numéro de téléphone pour l'affichage
 * @param phone - Numéro complet
 * @returns Numéro masqué (ex: +243 *** *** 678)
 */
export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 4) return phone;
  
  const lastDigits = phone.slice(-3);
  const prefix = phone.slice(0, 4); // +243
  
  return `${prefix} *** *** ${lastDigits}`;
};

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phone - Numéro complet (+243812345678)
 * @returns Numéro formaté (+243 812 345 678)
 */
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return "";
  
  // Supprimer tous les espaces
  const cleaned = phone.replace(/\s/g, "");
  
  // Format: +243 XXX XXX XXX
  if (cleaned.startsWith("+243") && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
  }
  
  return phone;
};
