import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, AuthSession } from "./auth-client";

interface AuthContextType {
  session: AuthSession;
  loading: boolean;
  error: string | null;
  signIn: (login: string, password: string) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification global
 * Enveloppe toute l'application pour fournir le contexte d'authentification
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger la session au montage
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

  const refreshSession = async () => {
    await loadSession();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        error,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
