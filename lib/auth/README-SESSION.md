# Gestion de Session - Comportement

## Scénarios de gestion des tokens

### ✅ Scénario 1 : Access token expiré, refresh token valide
**Comportement attendu :** La session reste active

1. Requête API → 401 (access token expiré)
2. Intercepteur détecte le 401
3. Appelle l'endpoint de refresh avec le refresh token
4. ✅ Succès → Nouveau access token reçu
5. Stocke le nouveau access token
6. Réessaie la requête originale avec le nouveau token
7. **Session reste active** ✅

**Logs :**
```
(aucun log d'erreur)
```

---

### ❌ Scénario 2 : Refresh token blacklisté/expiré
**Comportement attendu :** La session expire

1. Requête API → 401 (access token expiré)
2. Intercepteur détecte le 401
3. Appelle l'endpoint de refresh avec le refresh token
4. ❌ Django retourne 401 avec `code: "token_not_valid"` ou `detail: "blacklisted"`
5. Détection du token blacklisté
6. Marque `isSessionExpired = true`
7. Nettoie le SecureStore (access, refresh, user)
8. Crée une erreur `SESSION_EXPIRED`
9. Hook `useSessionExpiration` affiche l'alerte
10. Redirige vers `/login`
11. **Session expire** ❌

**Logs :**
```
🔒 Refresh token blacklisté ou expiré - Déconnexion automatique
```

---

### ⚠️ Scénario 3 : Erreur réseau lors du refresh
**Comportement attendu :** La session reste active (erreur temporaire)

1. Requête API → 401 (access token expiré)
2. Intercepteur détecte le 401
3. Appelle l'endpoint de refresh avec le refresh token
4. ⚠️ Erreur réseau (timeout, pas de connexion, etc.)
5. Détection : ce n'est PAS un token blacklisté (pas de response.status)
6. **Ne nettoie PAS le storage**
7. Rejette l'erreur
8. L'utilisateur peut réessayer plus tard
9. **Session reste active** ✅

**Logs :**
```
⚠️ Erreur lors du refresh token (non-critique): Network Error
```

---

### ⚠️ Scénario 4 : Erreur serveur (500) lors du refresh
**Comportement attendu :** La session reste active (erreur temporaire)

1. Requête API → 401 (access token expiré)
2. Intercepteur détecte le 401
3. Appelle l'endpoint de refresh avec le refresh token
4. ⚠️ Serveur retourne 500 (erreur interne)
5. Détection : ce n'est PAS un token blacklisté (status !== 401)
6. **Ne nettoie PAS le storage**
7. Rejette l'erreur
8. L'utilisateur peut réessayer plus tard
9. **Session reste active** ✅

**Logs :**
```
⚠️ Erreur lors du refresh token (non-critique): Request failed with status code 500
```

---

## Critères de détection du refresh token blacklisté

Le système considère qu'un refresh token est blacklisté/expiré **UNIQUEMENT** si :

1. ✅ Il y a une réponse du serveur (`refreshError.response` existe)
2. ✅ Le status est 401
3. ✅ ET l'une des conditions suivantes :
   - `response.data.code === "token_not_valid"`
   - `response.data.detail` contient "blacklist"
   - `response.data.detail` contient "invalid"
   - `response.data.detail` contient "expired"
   - `response.data.detail` contient "Token is blacklisted"
   - `response.data.detail` contient "Token is invalid or expired"

**Si ces conditions ne sont PAS remplies**, le storage n'est PAS nettoyé et la session reste active.

---

## Protection contre les boucles infinies

1. **Flag `isSessionExpired`** - Bloque toutes les requêtes après expiration
2. **Nettoyage direct du storage** - Pas d'appel API de logout
3. **Flag `hasShownAlert`** - Affiche l'alerte une seule fois
4. **File d'attente** - Évite les refresh multiples simultanés

---

## Réinitialisation du flag

Le flag `isSessionExpired` est réinitialisé à `false` lors de :
- `authService.signIn()` - Connexion réussie
- `authService.validateSession()` - Validation réussie au démarrage

---

## Tests manuels

### Test 1 : Access token expiré
1. Attendre que l'access token expire (généralement 5-15 minutes)
2. Faire une requête API
3. ✅ Vérifier que la requête réussit après le refresh automatique
4. ✅ Vérifier qu'aucune alerte n'est affichée
5. ✅ Vérifier que l'utilisateur reste connecté

### Test 2 : Refresh token expiré
1. Attendre que le refresh token expire (généralement 7-30 jours)
2. Faire une requête API
3. ✅ Vérifier que l'alerte "Session expirée" s'affiche
4. ✅ Vérifier la redirection vers `/login`
5. ✅ Vérifier que le storage est vide

### Test 3 : Erreur réseau
1. Désactiver le wifi/données
2. Faire une requête API
3. ✅ Vérifier qu'une erreur réseau est affichée
4. ✅ Vérifier que l'utilisateur reste connecté
5. ✅ Réactiver le réseau et réessayer → doit fonctionner

---

## Fichiers concernés

- `/lib/auth/auth-client.ts` - Intercepteur et logique de refresh
- `/lib/auth/useSessionExpiration.ts` - Hook pour gérer l'expiration
- `/app/_layout.tsx` - Utilise le hook
- `/screens/SplashScreen.tsx` - Valide la session au démarrage
