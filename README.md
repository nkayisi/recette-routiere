# # Recette Routière - Application Mobile

Application mobile de gestion des perceptions routières pour la RDC.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Lancer l'application

```bash
npx expo start
```

## 🔐 Système d'authentification

L'application utilise un système d'authentification personnalisé avec **Django SimpleJWT** pour le backend.

### Architecture

- **Backend** : Django REST Framework + SimpleJWT
- **Frontend** : React Native + Expo
- **Storage** : expo-secure-store (stockage sécurisé des tokens)
- **HTTP Client** : Axios avec intercepteurs automatiques

### Fichiers principaux

```
lib/auth/
├── auth-client.ts       # Service d'authentification + API Axios
├── useAuth.ts           # Hook React pour gérer l'état d'auth
├── AuthContext.tsx      # Context Provider global (optionnel)
├── USAGE_EXAMPLES.md    # Guide complet d'utilisation
components/
├── ProtectedRoute.tsx   # Composant pour protéger les routes
```

📖 **[Voir le guide complet d'utilisation](./lib/auth/USAGE_EXAMPLES.md)**

### Utilisation

#### 1. Connexion

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function LoginScreen() {
  const { signIn, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn("+243812345678", "password123");
      // Rediriger vers la page d'accueil
    } catch (err) {
      console.error(err.message);
    }
  };
}
```

#### 2. Accéder à la session

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function ProfileScreen() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <ActivityIndicator />;
  if (!isAuthenticated) return <Text>Non connecté</Text>;

  return <Text>Bonjour {user?.username}</Text>;
}
```

#### 3. Déconnexion

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function ProfileScreen() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Rediriger vers la page de connexion
  };
}
```

#### 4. Protéger une route

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function HomeScreen() {
  return (
    <ProtectedRoute>
      <View>
        {/* Contenu protégé */}
      </View>
    </ProtectedRoute>
  );
}
```

#### 5. Faire des requêtes authentifiées

```typescript
import { api } from "@/lib/auth/auth-client";

// Le token est automatiquement ajouté aux headers
const response = await api.get("/perceptions/");
const perceptions = response.data;
```

### Configuration Backend Django

Votre backend Django doit exposer ces endpoints :

```
POST /api/auth/login/
Body: { "login": "+243812345678", "password": "password123" }
Response: { "access": "...", "refresh": "...", "user": {...} }

POST /api/auth/refresh/
Body: { "refresh": "..." }
Response: { "access": "..." }

POST /api/auth/logout/
Body: { "refresh": "..." }
Response: { "message": "Logged out successfully" }
```

### Fonctionnalités

✅ **Refresh automatique des tokens** : Les tokens expirés sont automatiquement rafraîchis  
✅ **Stockage sécurisé** : Utilise expo-secure-store pour chiffrer les tokens  
✅ **Intercepteurs Axios** : Ajoute automatiquement le token à chaque requête  
✅ **Gestion d'erreurs** : Déconnexion automatique si le refresh échoue  
✅ **TypeScript** : Types complets pour une meilleure DX  

### Configuration

Modifiez l'URL du backend dans `/lib/auth/auth-client.ts` :

```typescript
const BACKEND_URL = "http://192.168.1.14:8000/api"; // Votre URL
```

## 📱 Structure de l'application

```
app/
├── index.tsx           # Splash screen
├── login.tsx           # Écran de connexion
├── home.tsx            # Page d'accueil (protégée)
├── profile.tsx         # Profil utilisateur
screens/
├── LoginScreen.tsx     # Composant de connexion
├── HomeScreen.tsx      # Composant d'accueil
components/
├── ProtectedRoute.tsx  # Protection des routes
lib/auth/
├── auth-client.ts      # Service d'authentification
├── useAuth.ts          # Hook React
```

## 🛠️ Technologies

- **React Native** 0.81.5
- **Expo** ~54.0.20
- **TypeScript** ~5.9.2
- **NativeWind** 4.2.1 (TailwindCSS)
- **Axios** 1.12.2
- **Expo Router** ~6.0.13
- **Expo Secure Store** ^15.0.7

## 📝 Notes importantes

1. **Sécurité** : Les tokens sont stockés dans expo-secure-store (chiffrement matériel)
2. **Refresh automatique** : Les tokens sont rafraîchis automatiquement avant expiration
3. **Gestion d'erreurs** : Toutes les erreurs réseau sont gérées avec des messages clairs
4. **TypeScript** : Types complets pour éviter les erreurs

## 🤝 Contribution

Pour contribuer au projet, suivez ces étapes :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
