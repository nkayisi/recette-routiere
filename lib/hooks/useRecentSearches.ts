import { useState, useEffect, useCallback } from "react";
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "@/lib/utils/recentSearches";

/**
 * Hook pour gérer les recherches récentes
 * 
 * @example
 * ```typescript
 * const { searches, addSearch, removeSearch, clearAll } = useRecentSearches();
 * ```
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les recherches récentes au montage
  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentSearches();
      setSearches(data);
    } catch (error) {
      console.error("Erreur lors du chargement des recherches récentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSearch = useCallback(async (search: string) => {
    await addRecentSearch(search);
    await loadSearches();
  }, []);

  const removeSearch = useCallback(async (search: string) => {
    await removeRecentSearch(search);
    await loadSearches();
  }, []);

  const clearAll = useCallback(async () => {
    await clearRecentSearches();
    setSearches([]);
  }, []);

  return {
    searches,
    isLoading,
    addSearch,
    removeSearch,
    clearAll,
    refresh: loadSearches,
  };
}
