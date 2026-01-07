# 🛍️ E-Commerce Cosmetics - Application MERN Full-Stack

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)

Application e-commerce complète pour produits cosmétiques avec intelligence artificielle intégrée, système de recommandations personnalisées, gestion des missions et tableau de bord utilisateur.

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Technologies Utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Structure du Projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Contribution](#contribution)
- [License](#license)

## 🎯 Aperçu

Cette application est une plateforme e-commerce moderne spécialisée dans les produits cosmétiques. Elle intègre des fonctionnalités avancées d'intelligence artificielle pour offrir une expérience utilisateur personnalisée et interactive.

### Caractéristiques Principales

- 🤖 **Assistant IA conversationnel** pour conseiller les utilisateurs
- 🎯 **Système de recommandations personnalisées** basé sur les préférences et l'historique
- ✅ **Système de missions** pour engager les utilisateurs
- 🛒 **Panier d'achat** complet avec gestion des commandes
- 👤 **Gestion de profil** avec questionnaire d'onboarding
- ⭐ **Système d'avis** et de notation des produits
- 📦 **Gestion des commandes** et historique
- 🔐 **Authentification sécurisée** avec JWT

## ✨ Fonctionnalités

### Pour les Utilisateurs

- **Authentification & Autorisation**
  - Inscription et connexion sécurisées
  - Gestion de profil personnalisé
  - Questionnaire d'onboarding pour personnalisation

- **Catalogue de Produits**
  - Navigation par catégories
  - Recherche et filtrage avancés
  - Détails complets des produits
  - Images et descriptions

- **Intelligence Artificielle**
  - Chatbot conversationnel (Google Gemini AI)
  - Recommandations personnalisées basées sur l'IA
  - Résumés intelligents des produits
  - Suggestions contextuelles

- **Système de Missions**
  - Missions personnalisées basées sur le profil
  - Suivi de progression
  - Récompenses et engagement

- **Gestion du Panier & Commandes**
  - Ajout/suppression de produits
  - Modification des quantités
  - Processus de commande complet
  - Historique des commandes

- **Avis & Évaluations**
  - Notation des produits (1-5 étoiles)
  - Commentaires détaillés
  - Affichage des avis vérifiés

### Pour les Administrateurs

- Gestion complète des produits (CRUD)
- Gestion des catégories
- Suivi des commandes
- Gestion des utilisateurs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React)                       │
│  - Interface utilisateur (Vite + React)                 │
│  - Gestion d'état (Context API)                         │
│  - Routing (React Router)                               │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────┐
│                  Backend (Express)                       │
│  - API RESTful                                          │
│  - Authentification JWT                                 │
│  - Middleware de validation                             │
│  - Services métier                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬─────────────┐
        │                     │             │
┌───────▼────────┐  ┌────────▼────────┐  ┌▼────────────┐
│   MongoDB      │  │  Google Gemini  │  │   Storage   │
│   Database     │  │      AI API     │  │             │
└────────────────┘  └─────────────────┘  └─────────────┘
```

## 🛠️ Technologies Utilisées

### Frontend
- **React 19.2** - Framework UI
- **React Router DOM 7.11** - Gestion du routing
- **Vite 5.4** - Build tool et dev server
- **Tailwind CSS 4.1** - Framework CSS utilitaire
- **TanStack Query 5.90** - Gestion d'état serveur
- **Axios 1.13** - Client HTTP
- **Lucide React** - Bibliothèque d'icônes

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5.1** - Framework web
- **MongoDB 8.19** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcryptjs** - Hachage des mots de passe
- **Google Generative AI** - Intelligence artificielle
- **CORS** - Gestion des requêtes cross-origin

### Outils de Développement
- **ESLint** - Linter JavaScript
- **Nodemon** - Auto-restart du serveur
- **dotenv** - Gestion des variables d'environnement

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18.0.0 ou supérieur) - [Télécharger](https://nodejs.org/)
- **MongoDB** (v6.0 ou supérieur) - [Télécharger](https://www.mongodb.com/try/download/community) ou utilisez MongoDB Atlas
- **npm** ou **yarn** - Gestionnaire de paquets (inclus avec Node.js)
- **Git** - Pour cloner le repository

### Compte Google AI (pour les fonctionnalités IA)
- Créer un compte sur [Google AI Studio](https://makersuite.google.com/)
- Obtenir une clé API Gemini

## 🚀 Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-username/mini-projet-mern-Manar-Trimeche-.git
cd mini-projet-mern-Manar-Trimeche-
```

### 2. Installer les Dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/cosmetics-db
# Ou pour MongoDB Atlas :
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmetics-db

# JWT Configuration
JWT_SECRET=votre_secret_jwt_très_sécurisé_changez_moi
JWT_EXPIRE=7d

# Google AI Configuration
GEMINI_API_KEY=votre_clé_api_gemini

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Frontend Configuration

Le frontend utilise Vite qui configure automatiquement les variables d'environnement. Créez un fichier `.env` dans le dossier `frontend/` si nécessaire :

```env
VITE_API_URL=http://localhost:5000/api
```

### Configuration MongoDB

#### Option 1 : MongoDB Local

1. Installez MongoDB Community Edition
2. Démarrez le service MongoDB
3. Utilisez l'URI : `mongodb://localhost:27017/cosmetics-db`

#### Option 2 : MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Ajoutez votre IP aux autorisations
5. Obtenez la chaîne de connexion
6. Remplacez dans `.env` : `MONGO_URI=mongodb+srv://...`

## 🎬 Démarrage

### Développement

#### 1. Démarrer MongoDB (si local)
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### 2. Démarrer le Backend
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

#### 3. Démarrer le Frontend (nouveau terminal)
```bash
cd frontend
npm run dev
```
L'application démarre sur `http://localhost:5173`

### Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Structure du Projet

```
mini-projet-mern-Manar-Trimeche-/
│
├── backend/                    # Application serveur Node.js/Express
│   ├── config/                 # Fichiers de configuration
│   │   └── db.js              # Configuration MongoDB
│   ├── controllers/            # Contrôleurs de l'API
│   │   ├── aiController.js    # Gestion des requêtes IA
│   │   ├── authController.js  # Authentification
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── profileController.js
│   │   ├── reviewController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/             # Middlewares Express
│   │   └── authMiddleware.js  # Protection des routes
│   ├── models/                 # Modèles Mongoose
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Product.js
│   │   ├── Profile.js
│   │   ├── Review.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/                 # Définition des routes
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── services/               # Logique métier
│   │   ├── aiService.js       # Service Google Gemini
│   │   └── recommendationService.js
│   ├── .env                    # Variables d'environnement
│   ├── package.json
│   └── server.js              # Point d'entrée
│
├── frontend/                   # Application cliente React
│   ├── public/                # Fichiers statiques
│   ├── src/
│   │   ├── api/               # Configuration API
│   │   │   └── api.js
│   │   ├── assets/            # Images, icônes
│   │   ├── components/        # Composants React
│   │   │   ├── AIChatbot.jsx
│   │   │   ├── AIRecommendations.jsx
│   │   │   ├── AISummary.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OnboardingQuestionnaire.jsx
│   │   │   └── TaskDashboard.jsx
│   │   ├── context/           # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── Addresses.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Missions.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx            # Composant principal
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx           # Point d'entrée
│   ├── .env                   # Variables d'environnement
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md                   # Ce fichier
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur (protégé)

#### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détail d'un produit
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/:id` - Modifier un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

#### Catégories
- `GET /api/categories` - Liste des catégories
- `POST /api/categories` - Créer une catégorie (admin)

#### Commandes
- `GET /api/orders` - Mes commandes (protégé)
- `POST /api/orders` - Créer une commande (protégé)
- `GET /api/orders/:id` - Détail d'une commande (protégé)

#### Profil
- `GET /api/profile` - Mon profil (protégé)
- `PUT /api/profile` - Mettre à jour mon profil (protégé)
- `POST /api/profile/onboarding` - Compléter l'onboarding (protégé)

#### Missions
- `GET /api/tasks` - Mes missions (protégé)
- `PUT /api/tasks/:id` - Marquer une mission comme complétée (protégé)

#### Avis
- `GET /api/reviews/product/:productId` - Avis d'un produit
- `POST /api/reviews` - Ajouter un avis (protégé)

#### Intelligence Artificielle
- `POST /api/ai/chat` - Conversation avec le chatbot (protégé)
- `GET /api/ai/recommendations` - Recommandations personnalisées (protégé)
- `GET /api/ai/summary/:productId` - Résumé IA d'un produit (protégé)

### Format de Réponse

Toutes les réponses suivent ce format JSON :

```json
{
  "success": true,
  "data": { /* contenu de la réponse */ },
  "message": "Message descriptif"
}
```

En cas d'erreur :

```json
{
  "success": false,
  "error": "Message d'erreur",
  "statusCode": 400
}
```

### Authentification

Les routes protégées nécessitent un token JWT dans le header :

```
Authorization: Bearer <votre_token_jwt>
```

## 🔐 Sécurité

- **Mots de passe** : Hachage bcrypt avec salt rounds
- **JWT** : Tokens sécurisés avec expiration
- **CORS** : Configuration stricte des origines autorisées
- **Validation** : Validation des données côté serveur
- **Sanitization** : Protection contre les injections

## 🧪 Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📱 Fonctionnalités Détaillées

### Système d'Intelligence Artificielle

L'application intègre Google Gemini AI pour :
- **Chatbot conversationnel** : Répond aux questions sur les produits
- **Recommandations personnalisées** : Analyse le profil et l'historique
- **Résumés intelligents** : Génère des résumés de produits
- **Analyse de sentiments** : Comprend les besoins des utilisateurs

### Système de Missions

Les missions sont générées automatiquement basées sur :
- Type de peau
- Préoccupations beauté
- Budget
- Préférences de marques
- Historique d'achat

Exemples de missions :
- Découvrir une nouvelle catégorie
- Ajouter 5 produits au panier
- Compléter une commande
- Laisser un avis

### Questionnaire d'Onboarding

Collecte les informations :
- Type de peau
- Préoccupations beauté principales
- Budget mensuel
- Préférences de marques
- Routines beauté

## 🐛 Dépannage

### Le serveur backend ne démarre pas
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez les variables d'environnement dans `.env`
- Assurez-vous que le port 5000 est disponible

### Erreur de connexion MongoDB
- Vérifiez l'URI de connexion
- Pour Atlas : vérifiez les autorisations IP
- Vérifiez les identifiants de connexion

### Le frontend ne se connecte pas à l'API
- Vérifiez que le backend est démarré
- Vérifiez la configuration CORS
- Vérifiez l'URL de l'API dans la configuration frontend

### Problèmes avec l'IA
- Vérifiez votre clé API Gemini
- Assurez-vous d'avoir du crédit/quota API
- Vérifiez la connexion internet

## 🚀 Déploiement

### Backend (Heroku/Railway/Render)

```bash
# Créer un fichier Procfile
echo "web: node server.js" > Procfile

# Déployer
git push heroku main
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers à déployer
```

### Variables d'Environnement en Production

N'oubliez pas de configurer toutes les variables d'environnement sur votre plateforme de déploiement.

## 📈 Améliorations Futures

- [ ] Panel d'administration complet
- [ ] Système de paiement (Stripe/PayPal)
- [ ] Notifications en temps réel
- [ ] Application mobile (React Native)
- [ ] Système de fidélité et points
- [ ] Chat en direct avec support
- [ ] Analyses et tableaux de bord
- [ ] Exportation de données
- [ ] API GraphQL
- [ ] Tests unitaires et d'intégration complets

## 👥 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Manar Trimeche**

## 🙏 Remerciements

- React Team pour le framework
- MongoDB pour la base de données
- Google pour l'API Gemini AI
- La communauté open source

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Envoyez un email à : support@cosmetics-ecommerce.com

---

Développé avec ❤️ par Manar Trimeche
