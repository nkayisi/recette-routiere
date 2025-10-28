import AsyncStorage from "@react-native-async-storage/async-storage";

const RECENT_SEARCHES_KEY = "@recette_routiere:recent_searches";
const MAX_RECENT_SEARCHES = 4;

/**
 * Récupérer les recherches récentes
 */
export async function getRecentSearches(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des recherches récentes:", error);
    return [];
  }
}

/**
 * Ajouter une recherche aux recherches récentes
 * - Évite les doublons
 * - Limite à MAX_RECENT_SEARCHES éléments
 * - Place la nouvelle recherche en premier
 */
export async function addRecentSearch(search: string): Promise<void> {
  try {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;

    const recentSearches = await getRecentSearches();
    
    // Retirer la recherche si elle existe déjà
    const filtered = recentSearches.filter((s) => s !== trimmedSearch);
    
    // Ajouter la nouvelle recherche au début
    const updated = [trimmedSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Erreur lors de l'ajout d'une recherche récente:", error);
  }
}

/**
 * Supprimer une recherche récente spécifique
 */
export async function removeRecentSearch(search: string): Promise<void> {
  try {
    const recentSearches = await getRecentSearches();
    const filtered = recentSearches.filter((s) => s !== search);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Erreur lors de la suppression d'une recherche récente:", error);
  }
}

/**
 * Effacer toutes les recherches récentes
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error("Erreur lors de l'effacement des recherches récentes:", error);
  }
}
