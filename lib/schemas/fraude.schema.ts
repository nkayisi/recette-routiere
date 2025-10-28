import { z } from "zod";

/**
 * Messages d'erreur personnalisés
 */
const errorMessages = {
  type_fraude: "Le type de fraude est requis",
  localisation: "La localisation est requise",
  localisation_max: "La localisation ne peut pas dépasser 255 caractères",
  description: "La description est requise",
  description_min: "La description doit contenir au moins 10 caractères",
  contact_max: "Le contact ne peut pas dépasser 255 caractères",
};

/**
 * Schéma de validation pour un signalement de fraude
 * Correspond aux champs du modèle Django backend
 */
export const fraudeSchema = z.object({
  // Type de fraude (requis)
  type_fraude: z.enum(["faux_recu", "corruption", "vehicule_suspect", "autre"], {
    message: errorMessages.type_fraude,
  }),

  // Localisation (requis, max 255 caractères)
  localisation: z
    .string({ message: errorMessages.localisation })
    .min(1, errorMessages.localisation)
    .max(255, errorMessages.localisation_max),

  // Description (requis, min 10 caractères)
  description: z
    .string({ message: errorMessages.description })
    .min(10, errorMessages.description_min),

  // Contact (optionnel, max 255 caractères)
  contact: z
    .string()
    .max(255, errorMessages.contact_max)
    .optional()
    .or(z.literal("")),
});

/**
 * Type TypeScript généré à partir du schéma Zod
 */
export type FraudeFormData = z.infer<typeof fraudeSchema>;
