# 🔧 Backend - E-Commerce Cosmetics API

API RESTful robuste pour application e-commerce de cosmétiques avec intelligence artificielle intégrée, construite avec Node.js, Express et MongoDB.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure](#structure)
- [API Endpoints](#api-endpoints)
- [Modèles de Données](#modèles-de-données)
- [Middleware](#middleware)
- [Services](#services)
- [Sécurité](#sécurité)
- [Tests](#tests)

## 🎯 Vue d'ensemble

Cette API fournit tous les services backend nécessaires pour une application e-commerce moderne :

- **Authentification & Autorisation** : Système JWT sécurisé
- **Gestion des Produits** : CRUD complet avec catégorisation
- **Système de Commandes** : Gestion complète du cycle de commande
- **Intelligence Artificielle** : Intégration Google Gemini pour chatbot et recommandations
- **Profils Utilisateurs** : Gestion personnalisée avec onboarding
- **Système de Missions** : Gamification et engagement utilisateur
- **Avis & Évaluations** : Système de feedback produits

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
│                   (Port 5000)                            │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │   Middleware    │
    │   - CORS        │
    │   - Auth JWT    │
    │   - Body Parser │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │     Routes      │
    │   API Endpoints │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │   Controllers   │
    │  Business Logic │
    └────────┬────────┘
             │
    ┌────────┴────────┬──────────────┬──────────────┐
    │                 │              │              │
┌───▼────┐    ┌──────▼──────┐  ┌───▼────┐   ┌────▼─────┐
│ Models │    │  Services   │  │ MongoDB│   │ Gemini AI│
│Mongoose│    │(AI, Reco)   │  │Database│   │   API    │
└────────┘    └─────────────┘  └────────┘   └──────────┘
```

## 🛠️ Technologies

### Core
- **Node.js** - Runtime JavaScript
- **Express.js 5.1** - Framework web minimaliste
- **MongoDB 8.19** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB

### Authentification & Sécurité
- **jsonwebtoken** - Génération et validation JWT
- **bcryptjs** - Hachage sécurisé des mots de passe
- **cors** - Gestion des requêtes cross-origin

### Intelligence Artificielle
- **@google/generative-ai** - API Google Gemini

### Utilitaires
- **dotenv** - Gestion des variables d'environnement
- **nodemon** - Auto-reload en développement

## 📦 Installation

### Prérequis

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm ou yarn

### Installation des dépendances

```bash
cd backend
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend/` :

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/cosmetics-db

# MongoDB Atlas (Cloud)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmetics-db?retryWrites=true&w=majority

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=votre_secret_jwt_super_sécurisé_changez_moi_en_production
JWT_EXPIRE=7d

# ============================================
# GOOGLE AI CONFIGURATION
# ============================================
GEMINI_API_KEY=votre_clé_api_gemini_depuis_google_ai_studio

# ============================================
# CORS CONFIGURATION
# ============================================
# Liste des origines autorisées (séparées par des virgules)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177
```

### Configuration MongoDB

#### Option 1 : MongoDB Local

```bash
# Installation sur Windows
# Téléchargez depuis https://www.mongodb.com/try/download/community

# Démarrer le service
net start MongoDB

# Vérifier la connexion
mongosh
```

#### Option 2 : MongoDB Atlas (Recommandé pour Production)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (gratuit disponible)
3. Créez un utilisateur de base de données
4. Ajoutez votre IP à la liste blanche (0.0.0.0/0 pour autoriser toutes les IPs)
5. Obtenez la chaîne de connexion
6. Remplacez dans `.env` : `MONGO_URI=mongodb+srv://...`

### Obtenir une clé API Google Gemini

1. Visitez [Google AI Studio](https://makersuite.google.com/)
2. Connectez-vous avec votre compte Google
3. Créez un nouveau projet
4. Générez une clé API
5. Copiez la clé dans `.env` : `GEMINI_API_KEY=...`

## 🚀 Démarrage

### Mode Développement (avec auto-reload)

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000` avec nodemon qui redémarre automatiquement à chaque modification.

### Mode Production

```bash
npm start
```

### Vérifier le fonctionnement

```bash
# Test de santé
curl http://localhost:5000/api/health

# Endpoint racine
curl http://localhost:5000/
```

## 📁 Structure du Projet

```
backend/
│
├── config/                     # Configuration
│   └── db.js                  # Configuration MongoDB & Connexion
│
├── controllers/                # Contrôleurs (logique métier)
│   ├── aiController.js        # Gestion IA (chat, recommandations)
│   ├── authController.js      # Authentification (register, login)
│   ├── categoryController.js  # Gestion des catégories
│   ├── orderController.js     # Gestion des commandes
│   ├── productController.js   # CRUD produits
│   ├── profileController.js   # Gestion profils utilisateurs
│   ├── reviewController.js    # Avis et évaluations
│   ├── taskController.js      # Système de missions
│   └── userController.js      # Gestion utilisateurs
│
├── middleware/                 # Middlewares Express
│   └── authMiddleware.js      # Protection des routes JWT
│
├── models/                     # Modèles Mongoose (Schémas)
│   ├── Category.js            # Catégorie de produits
│   ├── Order.js               # Commande
│   ├── OrderItem.js           # Article de commande
│   ├── Product.js             # Produit
│   ├── Profile.js             # Profil utilisateur
│   ├── Review.js              # Avis produit
│   ├── Task.js                # Mission utilisateur
│   └── User.js                # Utilisateur
│
├── routes/                     # Définition des routes
│   ├── aiRoutes.js            # Routes IA
│   ├── authRoutes.js          # Routes authentification
│   ├── categoryRoutes.js      # Routes catégories
│   ├── orderRoutes.js         # Routes commandes
│   ├── productRoutes.js       # Routes produits
│   ├── profileRoutes.js       # Routes profils
│   ├── reviewRoutes.js        # Routes avis
│   ├── taskRoutes.js          # Routes missions
│   └── userRoutes.js          # Routes utilisateurs
│
├── services/                   # Services métier
│   ├── aiService.js           # Service Google Gemini AI
│   └── recommendationService.js # Système de recommandations
│
├── .env                        # Variables d'environnement (à créer)
├── .gitignore                 # Fichiers ignorés par Git
├── package.json               # Dépendances et scripts
├── README.md                  # Ce fichier
├── server.js                  # Point d'entrée de l'application
└── test-models.js             # Script de test des modèles
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/api/auth`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| POST | `/register` | ❌ Public | Créer un nouveau compte |
| POST | `/login` | ❌ Public | Se connecter |
| GET | `/me` | ✅ Privée | Obtenir l'utilisateur connecté |

**Exemple Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "client"
}

# Réponse
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client"
  }
}
```

**Exemple Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}

# Réponse identique au register
```

### Product Routes (`/api/products`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ❌ Public | Liste tous les produits |
| GET | `/:id` | ❌ Public | Détail d'un produit |
| POST | `/` | ✅ Admin | Créer un produit |
| PUT | `/:id` | ✅ Admin | Modifier un produit |
| DELETE | `/:id` | ✅ Admin | Supprimer un produit |

**Exemple Get Products**
```bash
GET /api/products?category=soin&minPrice=10&maxPrice=50

# Réponse
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "...",
      "name": "Crème Hydratante",
      "description": "...",
      "price": 29.99,
      "category": "...",
      "stock": 45,
      "images": ["url1", "url2"]
    }
  ]
}
```

**Exemple Create Product**
```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sérum Anti-Age",
  "description": "Sérum révolutionnaire...",
  "price": 49.99,
  "category": "65a1b2c3d4e5f6g7h8i9j0",
  "stock": 100,
  "brand": "BeautyBrand",
  "images": ["https://example.com/image.jpg"]
}
```

### Category Routes (`/api/categories`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ❌ Public | Liste des catégories |
| GET | `/:id` | ❌ Public | Détail d'une catégorie |
| POST | `/` | ✅ Admin | Créer une catégorie |
| PUT | `/:id` | ✅ Admin | Modifier une catégorie |
| DELETE | `/:id` | ✅ Admin | Supprimer une catégorie |

### Order Routes (`/api/orders`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ✅ Privée | Mes commandes |
| GET | `/all` | ✅ Admin | Toutes les commandes |
| GET | `/:id` | ✅ Privée | Détail commande |
| POST | `/` | ✅ Privée | Créer une commande |
| PUT | `/:id/status` | ✅ Admin | Modifier le statut |
| DELETE | `/:id` | ✅ Admin | Supprimer une commande |

**Exemple Create Order**
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "65a1b2c3d4e5f6g7h8i9j0",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Rue de la Paix",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  },
  "paymentMethod": "card"
}
```

### Profile Routes (`/api/profile`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ✅ Privée | Mon profil |
| PUT | `/` | ✅ Privée | Mettre à jour le profil |
| POST | `/onboarding` | ✅ Privée | Compléter l'onboarding |

**Exemple Onboarding**
```bash
POST /api/profile/onboarding
Authorization: Bearer <token>
Content-Type: application/json

{
  "skinType": "mixte",
  "concerns": ["acne", "hydratation"],
  "budget": "moyen",
  "preferences": {
    "brands": ["CeraVe", "The Ordinary"],
    "ingredients": ["hyaluronic_acid"]
  }
}
```

### Task Routes (`/api/tasks`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ✅ Privée | Mes missions |
| GET | `/:id` | ✅ Privée | Détail d'une mission |
| PUT | `/:id/complete` | ✅ Privée | Compléter une mission |

### Review Routes (`/api/reviews`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/product/:productId` | ❌ Public | Avis d'un produit |
| POST | `/` | ✅ Privée | Ajouter un avis |
| PUT | `/:id` | ✅ Privée | Modifier mon avis |
| DELETE | `/:id` | ✅ Privée | Supprimer mon avis |

**Exemple Create Review**
```bash
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "product": "65a1b2c3d4e5f6g7h8i9j0",
  "rating": 5,
  "comment": "Produit excellent ! Très efficace."
}
```

### AI Routes (`/api/ai`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| POST | `/chat` | ✅ Privée | Conversation chatbot |
| GET | `/recommendations` | ✅ Privée | Recommandations personnalisées |
| GET | `/summary/:productId` | ✅ Privée | Résumé IA d'un produit |

**Exemple Chat**
```bash
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Quel produit me recommandez-vous pour la peau sèche ?"
}

# Réponse
{
  "success": true,
  "response": "Pour une peau sèche, je vous recommande...",
  "suggestions": [
    {
      "productId": "...",
      "reason": "..."
    }
  ]
}
```

### User Routes (`/api/users`)

| Méthode | Endpoint | Protection | Description |
|---------|----------|------------|-------------|
| GET | `/` | ✅ Admin | Liste des utilisateurs |
| GET | `/:id` | ✅ Admin | Détail utilisateur |
| PUT | `/:id` | ✅ Admin | Modifier utilisateur |
| DELETE | `/:id` | ✅ Admin | Supprimer utilisateur |

## 📊 Modèles de Données

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['client', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  stock: Number,
  brand: String,
  images: [String],
  rating: Number (0-5),
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  user: ObjectId (ref: User),
  items: [OrderItem],
  totalAmount: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String,
  paidAt: Date,
  deliveredAt: Date,
  createdAt: Date
}
```

### Profile Model

```javascript
{
  user: ObjectId (ref: User),
  skinType: String,
  concerns: [String],
  budget: String,
  preferences: {
    brands: [String],
    ingredients: [String]
  },
  onboardingCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model

```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  type: String,
  reward: Number,
  completed: Boolean,
  completedAt: Date,
  expiresAt: Date,
  createdAt: Date
}
```

### Review Model

```javascript
{
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5),
  comment: String,
  verified: Boolean,
  helpful: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model

```javascript
{
  name: String (unique),
  description: String,
  slug: String,
  image: String,
  parentCategory: ObjectId (ref: Category),
  createdAt: Date
}
```

## 🛡️ Middleware

### authMiddleware.js

Protège les routes nécessitant une authentification :

```javascript
const { protect, authorize } = require('./middleware/authMiddleware');

// Route protégée (utilisateur connecté)
router.get('/profile', protect, getProfile);

// Route admin seulement
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
```

**Fonctionnement** :
1. Vérifie la présence du token JWT dans le header `Authorization`
2. Décode et valide le token
3. Charge l'utilisateur depuis la base de données
4. Attache l'utilisateur à `req.user`
5. Vérifie le rôle si nécessaire (`authorize`)

## 🔧 Services

### aiService.js

Gestion de l'intelligence artificielle avec Google Gemini :

```javascript
const aiService = require('./services/aiService');

// Chat conversationnel
const response = await aiService.chat(message, context);

// Génération de recommandations
const recommendations = await aiService.generateRecommendations(userProfile, products);

// Résumé de produit
const summary = await aiService.summarizeProduct(product, reviews);
```

**Fonctionnalités** :
- Chatbot intelligent avec contexte
- Génération de recommandations personnalisées
- Analyse de sentiments
- Résumés automatiques
- Suggestions de produits

### recommendationService.js

Système de recommandations basé sur :

```javascript
const recommendationService = require('./services/recommendationService');

// Recommandations basées sur le profil
const recommendations = await recommendationService.getPersonalizedRecommendations(userId);

// Produits similaires
const similar = await recommendationService.getSimilarProducts(productId);

// Historique d'achat
const history = await recommendationService.getBasedOnPurchaseHistory(userId);
```

## 🔐 Sécurité

### Bonnes Pratiques Implémentées

1. **Mots de passe** :
   - Hachage avec bcrypt (10 rounds)
   - Jamais stockés en clair
   - Validation de complexité

2. **JWT** :
   - Tokens signés avec secret fort
   - Expiration après 7 jours
   - Validation à chaque requête

3. **CORS** :
   - Configuration stricte des origines
   - Méthodes HTTP limitées
   - Headers autorisés contrôlés

4. **Validation** :
   - Validation des entrées utilisateur
   - Sanitization des données
   - Protection contre les injections

5. **Rate Limiting** (à implémenter) :
   - Limiter les tentatives de connexion
   - Prévenir les attaques par force brute

### Recommandations de Production

```javascript
// À ajouter pour la production
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

app.use(helmet()); // Headers de sécurité
app.use(mongoSanitize()); // Prévient les injections NoSQL

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## 🧪 Tests

### Script de Test des Modèles

```bash
node test-models.js
```

Ce script :
- Vérifie la connexion MongoDB
- Teste tous les modèles
- Crée des données de test
- Valide les relations

### Tests Unitaires (à implémenter)

```bash
npm test
```

Structure recommandée :
```
backend/
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── services/
│   ├── integration/
│   │   └── routes/
│   └── fixtures/
│       └── testData.js
```

## 📝 Logs & Monitoring

### Logs de Développement

```javascript
// Les logs sont affichés dans la console
console.log('✅ Server started on port 5000');
console.log('🗄️ MongoDB Connected: cluster.mongodb.net');
```

### Production Logging (à implémenter)

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🚀 Performance

### Optimisations Implémentées

1. **Indexation MongoDB** :
   - Index sur les champs fréquemment recherchés
   - Index composites pour les requêtes complexes

2. **Pagination** :
   - Limite de résultats par page
   - Évite les surcharges mémoire

3. **Projection MongoDB** :
   - Sélection des champs nécessaires uniquement
   - Réduit la bande passante

### Optimisations Futures

- Mise en cache avec Redis
- Compression des réponses (gzip)
- CDN pour les images
- Load balancing
- Clustering Node.js


