import { useQuery } from "@tanstack/react-query";
import { searchPerceptions, type SearchResult } from "@/lib/api/perception.api";

/**
 * Hook React Query pour la recherche de perceptions
 * 
 * Utilise un debounce automatique et met en cache les résultats
 * pour une expérience de recherche fluide
 * 
 * @param query - Terme de recherche
 * @param enabled - Active ou désactive la recherche (par défaut: true si query a au moins 2 caractères)
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useSearch("CD-123");
 * ```
 */
export function useSearch(query: string, enabled?: boolean) {
  const trimmedQuery = query.trim();
  const shouldSearch = enabled !== undefined ? enabled : trimmedQuery.length >= 2;

  return useQuery<SearchResult[], Error>({
    queryKey: ["search", trimmedQuery],
    queryFn: () => searchPerceptions(trimmedQuery),
    enabled: shouldSearch,
    staleTime: 1000 * 60 * 5, // Les résultats restent frais pendant 5 minutes
    gcTime: 1000 * 60 * 10, // Garde en cache pendant 10 minutes
    retry: 1, // Réessaie une seule fois en cas d'échec
  });
}
