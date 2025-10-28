import { api } from "@/lib/auth/auth-client";
import type { PerceptionFormData } from "@/lib/schemas/perception.schema";

/**
 * Interface pour une zone
 */
export interface Zone {
  id: number;
  nom: string;
  code: string;
  description: string;
  localisation: string;
  geometrie: string;
  postes_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour un poste
 */
export interface Poste {
  id: number;
  nom: string;
  description: string;
  zone: Zone;
  adresse: string;
  telephone: string;
  email: string;
  responsable: number | null;
  position: string;
  is_active: boolean;
  recettes_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour un agent
 */
export interface Agent {
  id: number;
  user: number;
  poste: Poste;
  is_active: boolean;
  ID_agent: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour une perception retournée par l'API
 */
export interface Perception {
  id: number;
  numero: string;
  poste: Poste;
  montant: string;
  description: string | null;
  immatriculation: string;
  agent: Agent;
  type_recette: "peage" | "taxe_routiere";
  type_engin?: "moto" | "vehicule";
  categorie_engin?: string;
  usage_engin?: string;
  poids_engin?: number;
  checkings_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface pour la réponse paginée de l'API
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Paramètres pour filtrer les perceptions
 */
export interface GetPerceptionsParams {
  page?: number;
  page_size?: number;
  type_perception?: "peage" | "taxe_routiere";
  date_debut?: string; // Format: YYYY-MM-DD
  date_fin?: string; // Format: YYYY-MM-DD
  search?: string; // Recherche par numéro de plaque
}

/**
 * Interface pour les résultats de recherche
 */
export interface SearchResult {
  id: number;
  type: "perception";
  numero: string;
  immatriculation: string;
  montant: string;
  type_recette: "peage" | "taxe_routiere";
  created_at: string;
  poste_nom: string;
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
    console.log("📝 Données du formulaire:", perceptionData);
    
    // Préparer les données pour l'API
    const payload: any = {
      type_recette: perceptionData.type_perception,
      immatriculation: perceptionData.numero_plaque.toUpperCase(),
      description: perceptionData.description || null,
    };

    if (perceptionData.type_perception === "peage") {
      payload.type_engin = perceptionData.vehicule_type;
      
      // Pour les véhicules, ajouter la catégorie
      if (perceptionData.vehicule_type === "vehicule" && perceptionData.categorie) {
        payload.categorie_engin = perceptionData.categorie;
      }
      
      payload.usage_engin = perceptionData.usage.toLowerCase();

      // Calculer le montant automatiquement pour le péage
      const prices: Record<string, number> = {
        "moto": 500,
        "vehicule-leger": 1000,
        "vehicule-moyen": 2000,
        "vehicule-lourd": 3500,
        "vehicule-transport": 5000,
      };
      const key = perceptionData.vehicule_type === "moto" 
        ? "moto" 
        : `${perceptionData.vehicule_type}-${perceptionData.categorie}`;
      payload.montant = prices[key] || 0;
    } else {
      // Taxe routière
      payload.type_engin = 'vehicule';
      payload.poids_engin = parseInt(perceptionData.poids_engin);
      payload.usage_engin = perceptionData.usage.toLowerCase();
      payload.montant = parseFloat(perceptionData.montant);
    }

    console.log("📤 Payload envoyé au backend:", payload);

    // Appel API avec token JWT automatique
    const { data } = await api.post<Perception>("/recette-routiere/recettes/", payload);
    
    console.log("✅ Réponse du backend:", data);

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

/**
 * Récupérer les perceptions de l'agent connecté
 * 
 * @param params - Paramètres de filtrage et pagination
 * @returns Promise<PaginatedResponse<Perception>> - Liste paginée des perceptions
 * 
 * @example
 * ```typescript
 * // Récupérer toutes les perceptions (page 1)
 * const perceptions = await getAgentPerceptions();
 * console.log(perceptions.results); // [...]
 * 
 * // Avec filtres
 * const filtered = await getAgentPerceptions({
 *   page: 2,
 *   page_size: 20,
 *   type_perception: "peage",
 *   date_debut: "2025-01-01",
 *   search: "CD-123"
 * });
 * ```
 */
export async function getAgentPerceptions(
  agentId: number,
  params?: GetPerceptionsParams
): Promise<PaginatedResponse<Perception>> {
  try {
    // Construire les paramètres de requête
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    
    if (params?.page_size) {
      queryParams.append("page_size", params.page_size.toString());
    }
    
    if (params?.type_perception) {
      queryParams.append("type_recette", params.type_perception);
    }
    
    if (params?.date_debut) {
      queryParams.append("date_debut", params.date_debut);
    }
    
    if (params?.date_fin) {
      queryParams.append("date_fin", params.date_fin);
    }
    
    if (params?.search) {
      queryParams.append("search", params.search);
    }

    // Appel API
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/recette-routiere/agents/${agentId}/recettes/?${queryString}`
      : `/recette-routiere/agents/${agentId}/recettes/`;
    
    const { data } = await api.get<PaginatedResponse<Perception>>(url);

    return data;
  } catch (error: any) {
    // Gestion des erreurs
    if (error.response) {
      // Erreur d'authentification (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour voir les perceptions");
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

/**
 * Récupérer une perception spécifique par son ID
 * 
 * @param id - ID de la perception
 * @returns Promise<Perception> - La perception demandée
 * 
 * @example
 * ```typescript
 * const perception = await getPerceptionById(123);
 * console.log(perception.montant); // 1000
 * ```
 */
export async function getPerceptionById(id: number): Promise<Perception> {
  try {
    const { data } = await api.get<Perception>(`/recette-routiere/recettes/${id}/`);
    return data;
  } catch (error: any) {
    // Gestion des erreurs
    if (error.response) {
      // Erreur 404 - Perception non trouvée
      if (error.response.status === 404) {
        throw new Error("Perception non trouvée");
      }

      // Erreur d'authentification (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour voir cette perception");
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

/**
 * Récupérer les statistiques des perceptions de l'agent
 * 
 * @param date_debut - Date de début (optionnel)
 * @param date_fin - Date de fin (optionnel)
 * @returns Promise<PerceptionStats> - Statistiques
 * 
 * @example
 * ```typescript
 * const stats = await getPerceptionStats("2025-01-01", "2025-01-31");
 * console.log(stats.total_montant); // 150000
 * ```
 */
export interface PerceptionStats {
  total_perceptions: number;
  total_montant: number;
  total_peages: number;
  total_taxes: number;
  montant_peages: number;
  montant_taxes: number;
}

export async function getPerceptionStats(
  date_debut?: string,
  date_fin?: string
): Promise<PerceptionStats> {
  try {
    // Construire les paramètres de requête
    const queryParams = new URLSearchParams();
    
    if (date_debut) {
      queryParams.append("date_debut", date_debut);
    }
    
    if (date_fin) {
      queryParams.append("date_fin", date_fin);
    }

    // Appel API
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/recette-routiere/recettes/stats/?${queryString}`
      : "/recette-routiere/recettes/stats/";
    
    const { data } = await api.get<PerceptionStats>(url);

    return data;
  } catch (error: any) {
    // Gestion des erreurs
    if (error.response) {
      // Erreur d'authentification (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour voir les statistiques");
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

/**
 * Rechercher parmi toutes les perceptions
 * 
 * @param query - Terme de recherche (numéro de plaque, numéro de perception, etc.)
 * @returns Promise<SearchResult[]> - Liste des résultats de recherche
 * 
 * @example
 * ```typescript
 * const results = await searchPerceptions("CD-123");
 * console.log(results); // [{ id: 1, type: "perception", ... }]
 * ```
 */
export async function searchPerceptions(query: string): Promise<SearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Appel API avec le paramètre de recherche
    const { data } = await api.get<PaginatedResponse<Perception>>(
      `/recette-routiere/recettes/?search=${encodeURIComponent(query.trim())}`
    );

    // Transformer les perceptions en résultats de recherche
    const results: SearchResult[] = data.results.map((perception) => ({
      id: perception.id,
      type: "perception" as const,
      numero: perception.numero,
      immatriculation: perception.immatriculation,
      montant: perception.montant,
      type_recette: perception.type_recette,
      created_at: perception.created_at,
      poste_nom: perception.poste.nom,
    }));

    return results;
  } catch (error: any) {
    // Gestion des erreurs
    if (error.response) {
      // Erreur d'authentification (401)
      if (error.response.status === 401) {
        throw new Error("Vous devez être connecté pour effectuer une recherche");
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

/**
 * Mettre à jour une perception existante
 * 
 * @param id - ID de la perception à modifier
 * @param perceptionData - Données du formulaire validées par Zod
 * @returns Promise<Perception> - La perception mise à jour
 * 
 * @example
 * ```typescript
 * const data = {
 *   type_perception: "peage",
 *   vehicule_type: "vehicule",
 *   categorie: "leger",
 *   numero_plaque: "CD-12345",
 *   description: "Note modifiée"
 * };
 * 
 * const perception = await updatePerception(123, data);
 * ```
 */
export async function updatePerception(
  id: number,
  perceptionData: PerceptionFormData
): Promise<Perception> {
  try {
    console.log("📝 Mise à jour de la perception:", id, perceptionData);
    
    // Préparer les données pour l'API (même logique que createPerception)
    const payload: any = {
      type_recette: perceptionData.type_perception,
      immatriculation: perceptionData.numero_plaque.toUpperCase(),
      description: perceptionData.description || null,
    };

    if (perceptionData.type_perception === "peage") {
      payload.type_engin = perceptionData.vehicule_type;
      
      if (perceptionData.vehicule_type === "vehicule" && perceptionData.categorie) {
        payload.categorie_engin = perceptionData.categorie;
      }
      
      payload.usage_engin = perceptionData.usage.toLowerCase();

      // Calculer le montant automatiquement pour le péage
      const prices: Record<string, number> = {
        "moto": 500,
        "vehicule-leger": 1000,
        "vehicule-moyen": 2000,
        "vehicule-lourd": 3500,
        "vehicule-transport": 5000,
      };
      const key = perceptionData.vehicule_type === "moto" 
        ? "moto" 
        : `${perceptionData.vehicule_type}-${perceptionData.categorie}`;
      payload.montant = prices[key] || 0;
    } else {
      // Taxe routière
      payload.type_engin = 'vehicule';
      payload.poids_engin = parseInt(perceptionData.poids_engin);
      payload.usage_engin = perceptionData.usage.toLowerCase();
      payload.montant = parseFloat(perceptionData.montant);
    }

    console.log("📤 Payload de mise à jour:", payload);

    // Appel API PATCH pour mettre à jour
    const { data } = await api.patch<Perception>(
      `/recette-routiere/recettes/${id}/`,
      payload
    );
    
    console.log("✅ Perception mise à jour:", data);

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
        throw new Error("Vous devez être connecté pour modifier une perception");
      }

      // Erreur de permission (403)
      if (error.response.status === 403) {
        throw new Error("Vous n'avez pas la permission de modifier cette perception");
      }

      // Erreur 404 - Perception non trouvée
      if (error.response.status === 404) {
        throw new Error("Perception non trouvée");
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
