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
  poids_engin: "Le poids de l'engin est requis",
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
export const peageSchema = basePerceptionSchema
  .extend({
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
      .optional(),
    usage: z
      .enum(["Transport", "Commercial", "Agricole", "Personnel", "Professionnel", "Location"], {
        message: errorMessages.usage,
      })
      .refine((val) => val !== undefined && val !== null, {
        message: errorMessages.usage,
      }),
  })
  .refine(
    (data) => {
      // Si vehicule_type === "vehicule", categorie est requis
      if (data.vehicule_type === "vehicule") {
        return data.categorie && ["leger", "moyen", "lourd", "transport"].includes(data.categorie);
      }
      // Si vehicule_type === "moto", categorie doit être "standard"
      if (data.vehicule_type === "moto") {
        return data.categorie === "standard";
      }
      return true;
    },
    {
      message: errorMessages.categorie,
      path: ["categorie"],
    }
  );

/**
 * Schéma pour une perception de type TAXE ROUTIÈRE
 */
export const taxeSchema = basePerceptionSchema.extend({
  type_perception: z.literal("taxe_routiere"),
  poids_engin: z.string({ message: errorMessages.poids_engin }).min(1, errorMessages.poids_engin),
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
