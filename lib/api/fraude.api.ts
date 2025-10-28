import { api } from "@/lib/auth/auth-client";
import { FraudeFormData } from "@/lib/schemas/fraude.schema";

/**
 * Interface pour un signalement de fraude retourné par l'API
 */
export interface Signalement {
  id: number;
  type_fraude: "faux_recu" | "corruption" | "vehicule_suspect" | "autre";
  localisation: string; // Requis
  description: string;
  contact: string | null;
  agent: {
    id: number;
    username: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  statut?: string; // ex: "en_attente", "traite", "resolu"
}

/**
 * Créer un signalement de fraude
 * 
 * @param fraudeData - Données du formulaire validées par Zod
 * @returns Promise<Signalement> - Le signalement créé
 * 
 * @example
 * ```typescript
 * const data = {
 *   type_fraude: "faux_recu",
 *   localisation: "Poste de péage Matadi",
 *   description: "Un agent a émis un faux reçu sans enregistrer la perception",
 *   contact: "+243 XXX XXX XXX"
 * };
 * 
 * const signalement = await createSignalement(data);
 * console.log(signalement.id); // 123
 * ```
 */
export async function createSignalement(
  fraudeData: FraudeFormData
): Promise<Signalement> {
  try {
    console.log("📝 Données du signalement:", fraudeData);

    // Préparer les données pour l'API
    const payload: any = {
      type_fraude: fraudeData.type_fraude,
      localisation: fraudeData.localisation,
      description: fraudeData.description,
      contact: fraudeData.contact || null,
    };

    console.log("📤 Payload envoyé au backend:", payload);

    // Appel API avec token JWT automatique
    const { data } = await api.post<Signalement>("/recette-routiere/fraudes/", payload);

    console.log("✅ Réponse du backend:", data);

    return data;
  } catch (error: any) {
    console.error("❌ Erreur lors de la création du signalement:", error);

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

      // Non authentifié (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour signaler une fraude");
      }

      // Erreur serveur (500)
      if (error.response.status === 500) {
        throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
      }

      // Autre erreur HTTP
      throw new Error(
        error.response.data?.detail ||
        error.response.data?.message ||
        "Une erreur est survenue lors de l'envoi du signalement"
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

/**
 * Récupérer les signalements d'un agent
 * 
 * @param agentId - ID de l'agent
 * @returns Promise<Signalement[]> - Liste des signalements
 */
export async function getAgentSignalements(agentId: number): Promise<Signalement[]> {
  try {
    const { data } = await api.get<Signalement[]>(
      `/recette-routiere/agents/${agentId}/signalements-fraudes/`
    );
    return data;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des signalements:", error);
    throw new Error(
      error.response?.data?.detail ||
      "Impossible de récupérer les signalements"
    );
  }
}
