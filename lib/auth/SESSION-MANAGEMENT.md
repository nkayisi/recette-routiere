# Gestion de Session - Basée sur le Refresh Token

## Principe Fondamental

**La session est considérée valide SI ET SEULEMENT SI le refresh token existe et est valide.**

L'access token peut expirer, il sera automatiquement rafraîchi par les intercepteurs Axios.

## Architecture

### 1. Tokens

- **Access Token** : Token de courte durée (15 min typiquement)
  - Utilisé pour authentifier les requêtes API
  - Peut expirer à tout moment
  - Rafraîchi automatiquement par l'intercepteur Axios

- **Refresh Token** : Token de longue durée (7 jours typiquement)
  - Détermine si la session est valide
  - Utilisé pour obtenir de nouveaux access tokens
  - Stocké de manière sécurisée dans SecureStore

### 2. Fonction `getSession()`

```typescript
async getSession(): Promise<AuthSession> {
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  
  // ✅ Session valide = Refresh token existe
  if (!refreshToken) {
    return { isAuthenticated: false };
  }
  
  // ✅ Session valide même si access token expiré
  return { isAuthenticated: true };
}
```

**Logique :**
- ✅ Refresh token existe → Session valide
- ❌ Refresh token absent → Session invalide
- ⚠️ Access token expiré → Pas grave, sera rafraîchi automatiquement

### 3. Fonction `validateSession()`

Appelée au démarrage de l'app pour vérifier que le refresh token est toujours valide côté serveur.

```typescript
async validateSession(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    // Tester le refresh token
    const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
    
    // Mettre à jour l'access token
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
    
    return true; // ✅ Session valide
  } catch (error) {
    // Refresh token invalide/expiré
    await this.signOut(); // Nettoyer la session
    return false; // ❌ Session invalide
  }
}
```

### 4. Intercepteur Axios

Rafraîchit automatiquement l'access token quand il expire (401).

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Récupérer le refresh token
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      
      // Obtenir un nouvel access token
      const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
      
      // Mettre à jour l'access token
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
      
      // Réessayer la requête originale
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);
```

## Flux d'Authentification

### Connexion

1. Utilisateur entre login/password
2. Backend retourne `{ access, refresh, user }`
3. Stocker les 3 dans SecureStore
4. Session valide ✅

### Utilisation de l'App

1. Requête API avec access token
2. Si access token expiré (401) :
   - Intercepteur utilise refresh token
   - Obtient nouvel access token
   - Réessaye la requête
3. Si refresh token invalide :
   - Nettoyer la session
   - Rediriger vers login

### Démarrage de l'App

1. Charger la session avec `getSession()`
2. Si refresh token existe → Session valide
3. Appeler `validateSession()` pour vérifier côté serveur
4. Si refresh token valide :
   - Rafraîchir l'access token
   - Rediriger vers /home
5. Si refresh token invalide :
   - Nettoyer la session
   - Rediriger vers /login

### Déconnexion

1. Appeler endpoint de logout avec refresh token
2. Backend blackliste le refresh token
3. Nettoyer SecureStore (access, refresh, user)
4. Session invalide ❌

## Cas d'Usage

### ✅ Session Valide

```
Refresh Token: ✓ Existe et valide
Access Token: ✗ Expiré
→ Session VALIDE
→ Access token sera rafraîchi automatiquement
```

### ❌ Session Invalide

```
Refresh Token: ✗ Absent ou invalide
Access Token: ✓ Existe
→ Session INVALIDE
→ Redirection vers login
```

### ⚠️ Erreur Réseau

```
Refresh Token: ✓ Existe
Validation: ✗ Erreur réseau
→ Session CONSERVÉE
→ L'utilisateur peut réessayer plus tard
```

## Avantages

1. **Sécurité** : Refresh token de longue durée, access token de courte durée
2. **UX** : Pas de déconnexion intempestive si access token expire
3. **Fiabilité** : Session basée sur le token le plus stable (refresh)
4. **Automatique** : Rafraîchissement transparent pour l'utilisateur

## Points Clés

- ✅ **Session = Refresh Token valide**
- ✅ **Access Token expiré ≠ Session invalide**
- ✅ **Rafraîchissement automatique et transparent**
- ✅ **Déconnexion uniquement si refresh token invalide**

## Fichiers Modifiés

- `/lib/auth/auth-client.ts` : Logique de session basée sur refresh token
- `/lib/auth/AuthContext.tsx` : Contexte d'authentification
- `/screens/SplashScreen.tsx` : Validation de session au démarrage
