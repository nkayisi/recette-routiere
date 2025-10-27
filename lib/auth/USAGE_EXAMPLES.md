# Guide d'utilisation du système d'authentification

## 📋 Table des matières
1. [Configuration](#configuration)
2. [Connexion](#connexion)
3. [Déconnexion](#déconnexion)
4. [Accéder aux données utilisateur](#accéder-aux-données-utilisateur)
5. [Protéger une route](#protéger-une-route)
6. [Faire des requêtes authentifiées](#faire-des-requêtes-authentifiées)
7. [Gestion des erreurs](#gestion-des-erreurs)

---

## Configuration

### 1. Configurer l'URL du backend

Dans `/lib/auth/auth-client.ts`, ligne 28 :

```typescript
const BACKEND_URL = "http://127.0.0.1:8000/api"; // Changez selon votre environnement
```

**Environnements :**
- **Développement local** : `http://127.0.0.1:8000/api`
- **Émulateur Android** : `http://10.0.2.2:8000/api`
- **Réseau local** : `http://192.168.x.x:8000/api`
- **Production** : `https://api.votredomaine.com/api`

### 2. Endpoints requis sur le backend Django

```python
# urls.py
urlpatterns = [
    path('auth/login/', LoginView.as_view()),      # POST
    path('auth/refresh/', RefreshTokenView.as_view()),  # POST
    path('auth/logout/', LogoutView.as_view()),    # POST (optionnel)
]
```

**Format de réponse attendu pour `/auth/login/` :**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "phone": "+243812345678",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## Connexion

### Méthode 1 : Avec le hook `useAuth`

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function LoginScreen() {
  const { signIn, loading, error } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(`+243${phone}`, password);
      router.replace("/home");
    } catch (err) {
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <View>
      <TextInput value={phone} onChangeText={setPhone} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Connexion" onPress={handleLogin} disabled={loading} />
    </View>
  );
}
```

### Méthode 2 : Directement avec le service

```typescript
import { authService } from "@/lib/auth/auth-client";

const session = await authService.signIn("+243812345678", "password123");
console.log(session.user);
```

---

## Déconnexion

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          onPress: async () => {
            await signOut();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return <Button title="Se déconnecter" onPress={handleLogout} />;
}
```

---

## Accéder aux données utilisateur

```typescript
import { useAuth } from "@/lib/auth/useAuth";

function ProfileScreen() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!isAuthenticated) {
    return <Text>Non connecté</Text>;
  }

  return (
    <View>
      <Text>Nom : {user?.first_name} {user?.last_name}</Text>
      <Text>Email : {user?.email}</Text>
      <Text>Téléphone : {user?.phone}</Text>
      <Text>ID : {user?.id}</Text>
    </View>
  );
}
```

---

## Protéger une route

### Méthode 1 : Avec le composant `ProtectedRoute`

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function HomeScreen() {
  return (
    <ProtectedRoute>
      <View>
        <Text>Contenu protégé accessible uniquement si connecté</Text>
      </View>
    </ProtectedRoute>
  );
}
```

### Méthode 2 : Vérification manuelle

```typescript
import { useAuth } from "@/lib/auth/useAuth";

export default function HomeScreen() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) return <ActivityIndicator />;
  if (!isAuthenticated) return null;

  return <View>{/* Contenu protégé */}</View>;
}
```

---

## Faire des requêtes authentifiées

Le token est **automatiquement ajouté** à toutes les requêtes via l'intercepteur Axios.

```typescript
import { api } from "@/lib/auth/auth-client";

// GET
const getPerceptions = async () => {
  const response = await api.get("/perceptions/");
  return response.data;
};

// POST
const createPerception = async (data) => {
  const response = await api.post("/perceptions/", data);
  return response.data;
};

// PUT
const updatePerception = async (id, data) => {
  const response = await api.put(`/perceptions/${id}/`, data);
  return response.data;
};

// DELETE
const deletePerception = async (id) => {
  await api.delete(`/perceptions/${id}/`);
};
```

### Exemple complet

```typescript
import { api } from "@/lib/auth/auth-client";
import { useState, useEffect } from "react";

function PerceptionsScreen() {
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerceptions();
  }, []);

  const loadPerceptions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/perceptions/");
      setPerceptions(response.data);
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Impossible de charger les perceptions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlatList
      data={perceptions}
      renderItem={({ item }) => <PerceptionCard perception={item} />}
      refreshing={loading}
      onRefresh={loadPerceptions}
    />
  );
}
```

---

## Gestion des erreurs

### Erreurs de connexion

```typescript
try {
  await signIn(phone, password);
} catch (error) {
  // error.message contient le message d'erreur du backend
  if (error.message.includes("indisponible")) {
    Alert.alert("Erreur réseau", "Vérifiez votre connexion internet");
  } else if (error.message.includes("Identifiants")) {
    Alert.alert("Erreur", "Numéro ou mot de passe incorrect");
  } else {
    Alert.alert("Erreur", error.message);
  }
}
```

### Erreurs de requêtes API

```typescript
try {
  const response = await api.post("/perceptions/", data);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expiré - l'intercepteur va automatiquement rafraîchir
    console.log("Token expiré, refresh automatique en cours...");
  } else if (error.response?.status === 403) {
    Alert.alert("Accès refusé", "Vous n'avez pas les permissions");
  } else if (error.response?.status === 404) {
    Alert.alert("Erreur", "Ressource non trouvée");
  } else if (error.response?.status >= 500) {
    Alert.alert("Erreur serveur", "Le serveur rencontre un problème");
  } else {
    Alert.alert("Erreur", error.response?.data?.message || "Une erreur est survenue");
  }
}
```

---

## Fonctionnalités avancées

### Rafraîchir la session manuellement

```typescript
const { refreshSession } = useAuth();

// Rafraîchir les données utilisateur
await refreshSession();
```

### Vérifier si l'utilisateur est authentifié

```typescript
import { authService } from "@/lib/auth/auth-client";

const isAuth = await authService.isAuthenticated();
if (isAuth) {
  console.log("Utilisateur connecté");
}
```

### Récupérer la session actuelle

```typescript
import { authService } from "@/lib/auth/auth-client";

const session = await authService.getSession();
console.log(session.user);
console.log(session.accessToken);
```

---

## Débogage

### Activer les logs

Les logs sont déjà activés dans le code. Vérifiez la console pour :
- Erreurs de connexion
- Erreurs de lecture SecureStore
- Erreurs de refresh token

### Vérifier les tokens stockés

```typescript
import * as SecureStore from "expo-secure-store";

const accessToken = await SecureStore.getItemAsync("@auth/access_token");
const refreshToken = await SecureStore.getItemAsync("@auth/refresh_token");
const user = await SecureStore.getItemAsync("@auth/user");

console.log("Access Token:", accessToken);
console.log("Refresh Token:", refreshToken);
console.log("User:", JSON.parse(user));
```

### Nettoyer le storage (en cas de problème)

```typescript
import * as SecureStore from "expo-secure-store";

await SecureStore.deleteItemAsync("@auth/access_token");
await SecureStore.deleteItemAsync("@auth/refresh_token");
await SecureStore.deleteItemAsync("@auth/user");
```

---

## Bonnes pratiques

1. ✅ **Toujours utiliser HTTPS en production**
2. ✅ **Ne jamais logger les tokens en production**
3. ✅ **Gérer les erreurs réseau gracieusement**
4. ✅ **Afficher des messages d'erreur clairs à l'utilisateur**
5. ✅ **Déconnecter l'utilisateur si le refresh token échoue**
6. ✅ **Valider les entrées utilisateur avant l'envoi**
7. ✅ **Utiliser des indicateurs de chargement**
8. ✅ **Tester avec différents états réseau (offline, lent, etc.)**
