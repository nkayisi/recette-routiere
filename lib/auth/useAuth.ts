import { useState, useEffect, useCallback } from "react";
import { authService, AuthSession, DjangoUser } from "./auth-client";

/**
 * Hook personnalisé pour gérer l'authentification
 */
export function useAuth() {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la session au montage du composant
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      setLoading(true);
      const currentSession = await authService.getSession();
      setSession(currentSession);
    } catch (err) {
      console.error("Failed to load session:", err);
      setError("Impossible de charger la session");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (login: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const newSession = await authService.signIn(login, password);
      setSession(newSession);
      return newSession;
    } catch (err: any) {
      const errorMessage = err.message || "Échec de la connexion";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setSession({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError("Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    await loadSession();
  }, []);

  return {
    // État
    session,
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    loading,
    error,

    // Actions
    signIn,
    signOut,
    refreshSession,
  };
}
