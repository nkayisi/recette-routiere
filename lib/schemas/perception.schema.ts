import { z } from "zod";

/**
 * Messages d'erreur personnalisés
 */
const errorMessages = {
  numero_plaque: {
    required: "Le numéro de plaque est requis",
    max: "Le numéro de plaque ne peut pas dépasser 20 caractères",
  },
  vehicule_type: "Le type de l'engin est requis",
  categorie: "La catégorie est requise",
  poids: "Le poids de l'engin est requis",
  cylindree: "La cylindrée est requise",
  usage: "L'usage de l'engin est requis",
  montant: "Le montant est requis",
};

/**
 * Schéma de base pour une perception
 */
const basePerceptionSchema = z.object({
  numero_plaque: z
    .string()
    .min(1, errorMessages.numero_plaque.required)
    .max(20, errorMessages.numero_plaque.max),
  description: z.string().optional().or(z.literal("")),
});

/**
 * Schéma pour une perception de type PÉAGE
 */
export const peageSchema = basePerceptionSchema.extend({
  type_perception: z.literal("peage"),
  vehicule_type: z
    .enum(["moto", "vehicule"], {
      message: errorMessages.vehicule_type,
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errorMessages.vehicule_type,
    }),
  categorie: z
    .enum(["standard", "leger", "moyen", "lourd", "transport"], {
      message: errorMessages.categorie,
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errorMessages.categorie,
    }),
  usage: z
    .enum(["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"], {
      message: errorMessages.usage,
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errorMessages.usage,
    }),
});

/**
 * Schéma pour une perception de type TAXE ROUTIÈRE
 */
export const taxeSchema = basePerceptionSchema.extend({
  type_perception: z.literal("taxe"),
  poids: z.string({ message: errorMessages.poids }).min(1, errorMessages.poids),
  cylindree: z.string({ message: errorMessages.cylindree }).min(1, errorMessages.cylindree),
  usage: z
    .enum(["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"], {
      message: errorMessages.usage,
    })
    .refine((val) => val !== undefined && val !== null, {
      message: errorMessages.usage,
    }),
  montant: z.string({ message: errorMessages.montant }).min(1, errorMessages.montant),
});

/**
 * Schéma discriminé pour gérer les deux types de perception
 */
export const perceptionSchema = z.discriminatedUnion("type_perception", [
  peageSchema,
  taxeSchema,
]);

/**
 * Types TypeScript générés à partir des schémas Zod
 */
export type PerceptionFormData = z.infer<typeof perceptionSchema>;
export type PeageFormData = z.infer<typeof peageSchema>;
export type TaxeFormData = z.infer<typeof taxeSchema>;
