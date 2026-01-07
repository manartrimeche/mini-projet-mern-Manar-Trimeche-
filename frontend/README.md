# 🎨 Frontend - E-Commerce Cosmetics

Interface utilisateur moderne et réactive pour application e-commerce de cosmétiques, construite avec React, Vite et Tailwind CSS.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure](#structure)
- [Composants](#composants)
- [Pages](#pages)
- [Context API](#context-api)
- [Styling](#styling)
- [API Integration](#api-integration)
- [Fonctionnalités](#fonctionnalités)
- [Build & Déploiement](#build--déploiement)

## 🎯 Vue d'ensemble

Application React moderne offrant une expérience utilisateur fluide et intuitive pour l'e-commerce de produits cosmétiques avec intelligence artificielle intégrée.

### Caractéristiques Clés

- ⚡ **Performances optimales** avec Vite
- 🎨 **Design moderne** avec Tailwind CSS
- 🤖 **IA intégrée** : Chatbot et recommandations
- 📱 **Responsive** : Compatible mobile, tablette, desktop
- 🔐 **Authentification** JWT avec gestion de session
- 🛒 **Panier dynamique** avec Context API
- 🎯 **Système de missions** gamifiées
- ⭐ **Avis et évaluations** produits
- 🚀 **Navigation fluide** avec React Router

## 🛠️ Technologies

### Core
- **React 19.2** - Bibliothèque UI avec les dernières fonctionnalités
- **Vite 5.4** - Build tool ultra-rapide avec HMR
- **React Router DOM 7.11** - Routing côté client

### State Management
- **React Context API** - Gestion d'état globale
- **TanStack Query 5.90** - Gestion d'état serveur et cache

### Styling
- **Tailwind CSS 4.1** - Framework CSS utilitaire
- **PostCSS 8.5** - Transformations CSS
- **Autoprefixer 10.4** - Compatibilité navigateurs

### HTTP & API
- **Axios 1.13** - Client HTTP avec intercepteurs

### UI & Icons
- **Lucide React** - Bibliothèque d'icônes modernes

### Development Tools
- **ESLint 9.39** - Linter JavaScript
- **React Hooks ESLint Plugin** - Règles pour les hooks
- **React Refresh** - Hot reload pour React

## 📦 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Backend API en cours d'exécution

### Installation des dépendances

```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `frontend/` :

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development

# Optional: Analytics, Monitoring, etc.
# VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Configuration Vite

Le fichier `vite.config.js` est déjà configuré :

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### Configuration Tailwind

Le fichier `tailwind.config.js` définit les thèmes et extensions :

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
      }
    }
  },
  plugins: []
}
```

## 🚀 Démarrage

### Mode Développement

```bash
npm run dev
```

L'application démarre sur `http://localhost:5173` avec hot reload activé.

### Build Production

```bash
npm run build
```

Les fichiers optimisés sont générés dans le dossier `dist/`.

### Preview Production

```bash
npm run preview
```

Prévisualise le build de production localement.

### Linting

```bash
npm run lint
```

Vérifie le code avec ESLint.

## 📁 Structure du Projet

```
frontend/
│
├── public/                     # Fichiers statiques
│   ├── favicon.ico
│   └── images/
│
├── src/                        # Code source
│   ├── api/                    # Configuration API
│   │   └── api.js             # Instance Axios + intercepteurs
│   │
│   ├── assets/                 # Assets (images, fonts, etc.)
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── AIChatbot.jsx      # Chatbot IA flottant
│   │   ├── AIRecommendations.jsx # Recommandations personnalisées
│   │   ├── AISummary.jsx      # Résumé IA produit
│   │   ├── Navbar.jsx         # Barre de navigation
│   │   ├── OnboardingQuestionnaire.jsx # Questionnaire initial
│   │   └── TaskDashboard.jsx  # Tableau de bord missions
│   │
│   ├── context/                # Context API pour état global
│   │   ├── AuthContext.jsx    # Authentification utilisateur
│   │   └── CartContext.jsx    # Gestion du panier
│   │
│   ├── pages/                  # Pages de l'application
│   │   ├── Addresses.jsx      # Gestion des adresses
│   │   ├── Cart.jsx           # Page panier
│   │   ├── Home.jsx           # Page d'accueil
│   │   ├── Landing.jsx        # Page de landing
│   │   ├── Login.jsx          # Page de connexion
│   │   ├── Missions.jsx       # Page missions
│   │   ├── Orders.jsx         # Historique commandes
│   │   ├── ProductDetail.jsx  # Détail produit
│   │   ├── Products.jsx       # Liste produits
│   │   ├── Profile.jsx        # Page profil
│   │   └── Register.jsx       # Page d'inscription
│   │
│   ├── App.jsx                 # Composant racine
│   ├── App.css                # Styles globaux
│   ├── index.css              # Styles de base + Tailwind
│   └── main.jsx               # Point d'entrée
│
├── .env                        # Variables d'environnement
├── .gitignore
├── eslint.config.js           # Configuration ESLint
├── index.html                 # Template HTML
├── package.json               # Dépendances et scripts
├── postcss.config.js          # Configuration PostCSS
├── README.md                  # Ce fichier
├── tailwind.config.js         # Configuration Tailwind
└── vite.config.js             # Configuration Vite
```

## 🧩 Composants

### AIChatbot.jsx

Chatbot conversationnel flottant avec IA Google Gemini.

**Fonctionnalités** :
- Interface chat moderne
- Historique de conversation
- Réponses en temps réel
- Suggestions de questions
- Minimisable/Maximisable

**Utilisation** :
```jsx
import AIChatbot from './components/AIChatbot';

function App() {
  return (
    <>
      <AIChatbot />
      {/* Autres composants */}
    </>
  );
}
```

### AIRecommendations.jsx

Affiche des recommandations personnalisées basées sur l'IA.

**Props** :
- `userId` - ID de l'utilisateur
- `limit` - Nombre de recommandations

**Exemple** :
```jsx
<AIRecommendations userId={user.id} limit={5} />
```

### AISummary.jsx

Génère et affiche un résumé intelligent d'un produit.

**Props** :
- `productId` - ID du produit

**Exemple** :
```jsx
<AISummary productId={product._id} />
```

### Navbar.jsx

Barre de navigation responsive avec menu utilisateur.

**Fonctionnalités** :
- Logo et navigation principale
- Menu utilisateur (connecté/déconnecté)
- Badge panier avec nombre d'articles
- Responsive avec menu mobile
- Recherche rapide

### OnboardingQuestionnaire.jsx

Questionnaire modal pour personnaliser l'expérience utilisateur.

**Données collectées** :
- Type de peau
- Préoccupations beauté
- Budget mensuel
- Préférences de marques
- Routines actuelles

**Exemple** :
```jsx
<OnboardingQuestionnaire 
  onComplete={(data) => {
    console.log('Profil complété:', data);
  }} 
/>
```

### TaskDashboard.jsx

Tableau de bord affichant les missions de l'utilisateur.

**Fonctionnalités** :
- Liste des missions actives
- Progression visuelle
- Marquer comme complété
- Récompenses

## 📄 Pages

### Landing.jsx

Page d'accueil publique avec présentation du site.

**Sections** :
- Hero avec call-to-action
- Fonctionnalités principales
- Produits populaires
- Témoignages
- Footer

### Home.jsx

Tableau de bord principal pour utilisateurs connectés.

**Contenu** :
- Recommandations personnalisées
- Catégories populaires
- Nouveautés
- Missions actives

### Products.jsx

Liste des produits avec filtres et recherche.

**Fonctionnalités** :
- Grille de produits responsive
- Filtres (catégorie, prix, marque)
- Tri (prix, popularité, note)
- Pagination
- Recherche

### ProductDetail.jsx

Page détaillée d'un produit.

**Sections** :
- Galerie d'images
- Informations produit
- Résumé IA
- Prix et disponibilité
- Bouton d'ajout au panier
- Avis clients
- Produits similaires

### Cart.jsx

Page du panier d'achat.

**Fonctionnalités** :
- Liste des articles
- Modification des quantités
- Suppression d'articles
- Calcul du total
- Bouton de commande

### Profile.jsx

Page de profil utilisateur.

**Sections** :
- Informations personnelles
- Modification du profil
- Préférences beauté
- Historique de navigation
- Statistiques

### Orders.jsx

Historique des commandes.

**Affichage** :
- Liste des commandes
- Détail de chaque commande
- Statut de livraison
- Factures

### Missions.jsx

Page dédiée aux missions utilisateur.

**Contenu** :
- Missions actives
- Missions complétées
- Récompenses obtenues
- Progression globale

### Login.jsx

Page de connexion.

**Formulaire** :
- Email
- Mot de passe
- Lien "Mot de passe oublié"
- Lien vers inscription

### Register.jsx

Page d'inscription.

**Formulaire** :
- Nom complet
- Email
- Mot de passe
- Confirmation mot de passe
- Acceptation CGU

## 🌐 Context API

### AuthContext

Gestion de l'authentification globale.

**État** :
- `user` - Utilisateur connecté
- `token` - Token JWT
- `loading` - État de chargement
- `showOnboarding` - Afficher questionnaire

**Méthodes** :
- `login(email, password)` - Connexion
- `register(userData)` - Inscription
- `logout()` - Déconnexion
- `completeOnboarding(data)` - Compléter l'onboarding

**Utilisation** :
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (!user) {
    return <Login onLogin={login} />;
  }
  
  return (
    <div>
      <p>Bienvenue {user.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### CartContext

Gestion du panier d'achat.

**État** :
- `cart` - Articles dans le panier
- `totalItems` - Nombre total d'articles
- `totalPrice` - Prix total

**Méthodes** :
- `addToCart(product, quantity)` - Ajouter au panier
- `removeFromCart(productId)` - Retirer du panier
- `updateQuantity(productId, quantity)` - Modifier quantité
- `clearCart()` - Vider le panier

**Utilisation** :
```jsx
import { useCart } from './context/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  return (
    <button onClick={() => addToCart(product, 1)}>
      Ajouter au panier
    </button>
  );
}
```

## 🎨 Styling

### Tailwind CSS

L'application utilise Tailwind CSS pour un styling rapide et cohérent.

**Classes communes** :
```jsx
// Boutons
<button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
  Click me
</button>

// Cards
<div className="bg-white rounded-lg shadow-md p-6">
  Content
</div>

// Grilles
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Styles personnalisés

Les styles spécifiques sont dans `App.css` :

```css
/* Animations personnalisées */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

## 🔌 API Integration

### Configuration Axios

Le fichier `api/api.js` configure l'instance Axios :

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Utilisation dans les composants

```jsx
import api from '../api/api';

// GET request
const products = await api.get('/products');

// POST request
const newOrder = await api.post('/orders', orderData);

// PUT request
await api.put(`/profile`, profileData);

// DELETE request
await api.delete(`/cart/${itemId}`);
```

### TanStack Query (React Query)

Pour le cache et la gestion d'état serveur :

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

function Products() {
  // Fetch avec cache
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    }
  });

  // Mutation avec invalidation du cache
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newProduct) => api.post('/products', newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {data.products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

## ✨ Fonctionnalités

### Routes Protégées

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Utilisation
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

### Gestion des Erreurs

```jsx
import { useState } from 'react';

function Form() {
  const [error, setError] = useState(null);
  
  const handleSubmit = async (data) => {
    try {
      setError(null);
      await api.post('/endpoint', data);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };
  
  return (
    <>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      {/* Form */}
    </>
  );
}
```

### Loading States

```jsx
function ProductList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <div>{/* Products */}</div>;
}
```

## 🏗️ Build & Déploiement

### Build Production

```bash
npm run build
```

Génère :
- Fichiers optimisés et minifiés
- Code splitting automatique
- Assets avec hash pour le cache
- Dossier de sortie : `dist/`

### Optimisations de Build

Le build Vite inclut :
- **Tree-shaking** : Suppression du code inutilisé
- **Minification** : Réduction de la taille
- **Code splitting** : Chargement lazy des routes
- **Asset optimization** : Compression des images

### Déploiement Vercel

```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel

# Production
vercel --prod
```

Fichier `vercel.json` :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Déploiement Netlify

```bash
# Installation Netlify CLI
npm i -g netlify-cli

# Déploiement
netlify deploy

# Production
netlify deploy --prod
```

Fichier `netlify.toml` :
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables d'Environnement en Production

Sur votre plateforme de déploiement, configurez :

```env
VITE_API_URL=https://votre-api.com/api
VITE_NODE_ENV=production
```

## 📱 Responsive Design

L'application est entièrement responsive :

- **Mobile** : < 640px
- **Tablet** : 640px - 1024px
- **Desktop** : > 1024px

```jsx
// Exemple de grid responsive
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  gap-4
">
  {/* Items */}
</div>
```

## 🧪 Tests

### Tests Unitaires (à implémenter)

```bash
npm test
```

Recommandation : Vitest + React Testing Library

```javascript
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

test('renders product name', () => {
  const product = { name: 'Test Product', price: 29.99 };
  render(<ProductCard product={product} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

## 🐛 Dépannage

### Le frontend ne se connecte pas à l'API

```bash
# Vérifiez que le backend est démarré
curl http://localhost:5000/api/health

# Vérifiez la configuration dans vite.config.js
# Vérifiez VITE_API_URL dans .env
```

### Erreur CORS

```bash
# Le backend doit autoriser l'origine du frontend
# Dans backend/.env : CORS_ORIGINS=http://localhost:5173
```

### Hot Reload ne fonctionne pas

```bash
# Redémarrez le serveur de développement
npm run dev

# Videz le cache du navigateur
Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

### Build échoue

```bash
# Nettoyez et réinstallez
rm -rf node_modules package-lock.json
npm install

# Nettoyez le cache Vite
rm -rf node_modules/.vite
```

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/)
- [Axios](https://axios-http.com/)


