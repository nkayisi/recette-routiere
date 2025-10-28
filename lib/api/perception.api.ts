import { api } from "@/lib/auth/auth-client";
import type { PerceptionFormData } from "@/lib/schemas/perception.schema";

/**
 * Interface pour une perception retournée par l'API
 */
export interface Perception {
  id: number;
  type_perception: "peage" | "taxe";
  vehicule_type?: "moto" | "vehicule";
  categorie?: string;
  poids?: number;
  cylindree?: number;
  usage?: string;
  montant: number;
  numero_plaque: string;
  description?: string;
  agent?: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at?: string;
}

/**
 * Créer une nouvelle perception
 * 
 * @param perceptionData - Données du formulaire validées par Zod
 * @returns Promise<Perception> - La perception créée
 * 
 * @example
 * ```typescript
 * const data = {
 *   type_perception: "peage",
 *   vehicule_type: "vehicule",
 *   categorie: "leger",
 *   numero_plaque: "CD-12345",
 *   description: "Note optionnelle"
 * };
 * 
 * const perception = await createPerception(data);
 * console.log(perception.id); // 123
 * ```
 */
export async function createPerception(
  perceptionData: PerceptionFormData
): Promise<Perception> {
  try {
    // Préparer les données pour l'API
    const payload: any = {
      type_recette: perceptionData.type_perception,
      immatriculation: perceptionData.numero_plaque.toUpperCase(),
      description: perceptionData.description || null,
    };

    if (perceptionData.type_perception === "peage") {
      payload.type_engin = perceptionData.vehicule_type;
      payload.categorie_engin = perceptionData.categorie;
      payload.usage_engin = perceptionData.usage.toLowerCase();

      // Calculer le montant automatiquement pour le péage
      const prices: Record<string, number> = {
        "moto-standard": 500,
        "vehicule-leger": 1000,
        "vehicule-moyen": 2000,
        "vehicule-lourd": 3500,
        "vehicule-transport": 5000,
      };
      const key = `${perceptionData.vehicule_type}-${perceptionData.categorie}`;
      payload.montant = prices[key] || 0;
    } else {
      // Taxe routière
      payload.poids = parseInt(perceptionData.poids);
      payload.cylindree = parseInt(perceptionData.cylindree);
      payload.usage_engin = perceptionData.usage.toLowerCase();
      payload.montant = parseFloat(perceptionData.montant);
    }

    // Appel API avec token JWT automatique
    const { data } = await api.post<Perception>("/recette-routiere/recettes/", payload);

    return data;
  } catch (error: any) {
    // Gestion des erreurs
    if (error.response) {
      // Erreur de validation Django (400)
      if (error.response.status === 400) {
        const errors = error.response.data;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages}`)
          .join("\n");
        throw new Error(errorMessages);
      }

      // Erreur d'authentification (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour créer une perception");
      }

      // Erreur serveur (500)
      if (error.response.status >= 500) {
        throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
      }

      throw new Error(
        error.response.data?.detail || "Une erreur est survenue"
      );
    }

    // Erreur réseau
    if (error.request) {
      throw new Error(
        "Impossible de contacter le serveur. Vérifiez votre connexion internet."
      );
    }

    // Autre erreur
    throw new Error(error.message || "Une erreur inattendue est survenue");
  }
}
