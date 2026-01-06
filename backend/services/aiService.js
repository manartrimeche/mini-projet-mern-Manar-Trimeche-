const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with API key check
let model = null;

const initializeModel = () => {
  if (!model && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('✅ Modèle Gemini initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation Gemini:', error.message);
    }
  }
  return model;
};

/**
 * Génère une description de produit intelligente
 * @param {string} productName - Nom du produit
 * @param {string} category - Catégorie du produit
 * @returns {Promise<string>} Description générée
 */
exports.generateProductDescription = async (productName, category = "cosmetics") => {
  try {
    console.log('📝 Génération description:', { productName, category });
    
    const generativeModel = initializeModel();
    if (!generativeModel) {
      throw new Error('Modèle IA non disponible. Vérifiez que GEMINI_API_KEY est configurée.');
    }

    const prompt = `Générez une description de produit courte et attrayante (max 150 mots) pour un produit cosmétique nommé "${productName}" dans la catégorie "${category}". 
    
Soyez professionnel, engageant et soulignez les bénéfices. Format: texte simple, pas de markdown.`;

    console.log('  Appel API Gemini pour description...');
    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();
    console.log('✅ Description générée');
    return text;
  } catch (error) {
    console.error('❌ Erreur génération description:', error);
    throw new Error('Impossible de générer la description: ' + error.message);
  }
};

/**
 * Analyse le sentiment d'un avis produit
 * @param {string} reviewText - Texte de l'avis
 * @returns {Promise<Object>} { sentiment: 'positive|negative|neutral', score: 0-100 }
 */
exports.analyzeSentiment = async (reviewText) => {
  try {
    const generativeModel = initializeModel();
    if (!generativeModel) {
      throw new Error('Modèle IA non disponible');
    }

    const prompt = `Analysez le sentiment de cet avis client et retournez UNIQUEMENT un JSON valide sans texte supplémentaire:
    
Avis: "${reviewText}"

Retournez exactement ceci:
{"sentiment": "positive" ou "negative" ou "neutral", "score": nombre entre 0 et 100, "summary": "résumé court"}`;

    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();
    
    // Extraire le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse IA invalide');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Erreur analyse sentiment:', error);
    // Retourner une valeur par défaut en cas d'erreur
    return {
      sentiment: 'neutral',
      score: 50,
      summary: 'Analyse indisponible'
    };
  }
};

/**
 * Génère un résumé intelligent d'une liste d'avis
 * @param {Array<string>} reviews - Liste des textes d'avis
 * @returns {Promise<string>} Résumé généré
 */
exports.generateReviewsSummary = async (reviews) => {
  try {
    const generativeModel = initializeModel();
    if (!generativeModel) {
      throw new Error('Modèle IA non disponible');
    }

    if (reviews.length === 0) {
      return "Aucun avis disponible";
    }

    const reviewsText = reviews.slice(0, 10).join('\n- ');
    
    const prompt = `Générez un résumé concis (max 100 mots) des points clés de ces avis clients:

- ${reviewsText}

Focus sur les thèmes récurrents, points forts et améliorations suggérées.`;

    const result = await generativeModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Erreur résumé:', error);
    throw new Error('Impossible de générer le résumé');
  }
};

/**
 * Génère des recommandations de produits personnalisées
 * @param {string} userPreferences - Préférences utilisateur
 * @param {Array<Object>} products - Produits disponibles
 * @returns {Promise<Array<string>>} IDs des produits recommandés
 */
exports.generateRecommendations = async (userPreferences, products) => {
  try {
    const generativeModel = initializeModel();
    if (!generativeModel) {
      throw new Error('Modèle IA non disponible');
    }

    const productNames = products.map(p => `${p.name} (${p.category})`).join(', ');
    
    const prompt = `Basé sur ces préférences client: "${userPreferences}"
    
Recommandez 3-5 produits parmi cette liste (retournez UNIQUEMENT les noms):
${productNames}

Format: liste simple, un nom par ligne, pas de numérotation.`;

    const result = await generativeModel.generateContent(prompt);
    const text = result.response.text();
    
    // Extraire les noms recommandés
    const recommended = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        // Trouver le produit correspondant
        const product = products.find(p => 
          line.toLowerCase().includes(p.name.toLowerCase())
        );
        return product ? product._id : null;
      })
      .filter(id => id !== null);
    
    return recommended;
  } catch (error) {
    console.error('Erreur recommandations:', error);
    return [];
  }
};

/**
 * Génère une réponse d'assistance client
 * @param {string} question - Question de l'utilisateur
 * @param {string} context - Contexte (produit, commande, etc.)
 * @returns {Promise<string>} Réponse générée
 */
exports.generateCustomerSupport = async (question, context = "") => {
  try {
    console.log('Requête support:', { question, context });
    
    const generativeModel = initializeModel();
    if (!generativeModel) {
      console.warn('⚠️ Modèle IA non disponible, utilisation du fallback');
      return generateSupportFallback(question, context);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY non configurée, utilisation du fallback');
      return generateSupportFallback(question, context);
    }

    const prompt = `Tu es un assistant client pour une boutique cosmétique. Réponds à cette question de façon professionnelle et utile en français.
${context ? `Contexte: ${context}` : ''}

Question: ${question}

Réponse (concise, max 200 mots):`;

    console.log('  Appel API Gemini...');
    
    // Ajouter un timeout de 10 secondes
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout API Gemini (>10s)')), 10000)
    );
    
    const result = await Promise.race([
      generativeModel.generateContent(prompt),
      timeoutPromise
    ]);
    
    const text = result.response.text();
    console.log('✅ Réponse reçue de l\'IA');
    
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Réponse vide, utilisation du fallback');
      return generateSupportFallback(question, context);
    }

    return text;
  } catch (error) {
    console.error('❌ Erreur support:', error);
    console.error('Type erreur:', error.constructor.name);
    console.error('Message:', error.message);
    
    console.log('📋 Utilisation du fallback automatique...');
    return generateSupportFallback(question, context);
  }
};

/**
 * Réponse de fallback pour le support client
 * @param {string} question - Question de l'utilisateur
 * @param {string} context - Contexte
 * @returns {string} Réponse générique
 */
const generateSupportFallback = (question, context = "") => {
  const lowerQuestion = question.toLowerCase();
  
  // Réponses basées sur des mots-clés
  if (lowerQuestion.includes('livr') || lowerQuestion.includes('expéd') || lowerQuestion.includes('commande')) {
    return `Les commandes sont généralement expédiées sous 2-3 jours ouvrables. La livraison prend 5-7 jours selon votre localisation. Vous pouvez suivre votre commande via le lien de suivi envoyé par email. Pour toute question spécifique, contactez-nous directement. 📦`;
  }
  
  if (lowerQuestion.includes('retour') || lowerQuestion.includes('remboursement') || lowerQuestion.includes('échange')) {
    return `Nous offrons un programme de retour sans tracas dans les 30 jours suivant votre achat. Les produits non ouverts peuvent être échangés ou remboursés. Contactez notre équipe avec votre numéro de commande pour initier le processus. 💳`;
  }
  
  if (lowerQuestion.includes('produit') || lowerQuestion.includes('peau') || lowerQuestion.includes('cheveux') || lowerQuestion.includes('cosmétique')) {
    return `Nous proposons une large gamme de produits de beauté et de soins personnels pour tous les types de peau et de cheveux. Notre équipe d'experts peut vous aider à trouver les produits parfaits pour vos besoins. Consultez nos fiches produits détaillées ou contactez-nous pour des recommandations personnalisées. 💄`;
  }
  
  if (lowerQuestion.includes('prix') || lowerQuestion.includes('promo') || lowerQuestion.includes('réduction') || lowerQuestion.includes('code')) {
    return `Nous proposons régulièrement des promotions et des codes de réduction. Inscrivez-vous à notre newsletter pour être informé des offres spéciales. Certains produits sont en promotion toute l'année. Consultez notre page promos pour les réductions actuelles. 🎁`;
  }
  
  if (lowerQuestion.includes('ingrédient') || lowerQuestion.includes('allergie') || lowerQuestion.includes('sensible') || lowerQuestion.includes('naturel')) {
    return `Tous nos produits listent les ingrédients complets. Si vous avez des allergies ou une peau sensible, je vous recommande de vérifier la liste des ingrédients avant d'acheter. Pour une consultation personnalisée sur les produits adaptés à votre peau, contactez notre équipe d'experts. 🌿`;
  }
  
  if (lowerQuestion.includes('garantie') || lowerQuestion.includes('qualité') || lowerQuestion.includes('authentique')) {
    return `Tous nos produits sont 100% authentiques et proviennent directement des fabricants. Nous garantissons la qualité de tous nos produits. Si vous avez des préoccupations concernant un article, contactez-nous immédiatement. ✅`;
  }
  
  // Réponse par défaut générique
  return `Merci pour votre question! Je suis ravi de vous aider. Pouvez-vous me donner plus de détails sur ce que vous recherchez? Vous pouvez me poser des questions sur nos produits, les livraisons, les retours, les paiements, ou toute autre préoccupation. Comment puis-je vous assister davantage? 😊`;
};

/**
 * Génère des tâches personnalisées basées sur le profil de l'utilisateur
 * @param {Object} skinProfile - Profil de peau { skinType, skinConcerns, skinGoals, sensitivity }
 * @param {Object} hairProfile - Profil de cheveux { hairType, hairTexture, scalpType, hairConcerns, hairGoals }
 * @returns {Promise<Array>} Tableau de tâches générées
 */
exports.generateOnboardingTasks = async (skinProfile, hairProfile) => {
  try {
    console.log('Génération des tâches d\'intégration avec Gemini...');
    
    const generativeModel = initializeModel();
    if (!generativeModel) {
      console.warn('⚠️ Modèle IA non disponible, utilisation du fallback');
      return generateTasksFallback(skinProfile, hairProfile);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY non configurée, utilisation du fallback');
      return generateTasksFallback(skinProfile, hairProfile);
    }

    const profileSummary = `
Profil de peau:
- Type: ${skinProfile.skinType}
- Préoccupations: ${skinProfile.skinConcerns.join(', ')}
- Objectifs: ${skinProfile.skinGoals.join(', ')}
- Sensibilité: ${skinProfile.sensitivity}

Profil de cheveux:
- Type: ${hairProfile.hairType}
- Texture: ${hairProfile.hairTexture}
- Cuir chevelu: ${hairProfile.scalpType}
- Préoccupations: ${hairProfile.hairConcerns.join(', ')}
- Objectifs: ${hairProfile.hairGoals.join(', ')}
`;

    const prompt = `Tu es un expert beauté et bien-être. Génère 5-6 tâches personnalisées et motivantes basées sur ce profil utilisateur:

${profileSummary}

Génère UNIQUEMENT un JSON valide (sans texte supplémentaire) avec cette structure exacte:
{
  "tasks": [
    {
      "title": "Titre court et motivant",
      "description": "Description détaillée (2-3 phrases)",
      "category": "skincare|haircare|routine|shopping|review|social",
      "icon": "emoji approprié",
      "points": nombre entre 15 et 50,
      "discountPoints": nombre entre 0 et 25
    }
  ]
}

Conseils pour les tâches:
- Basez-les sur les préoccupations et objectifs spécifiques du profil
- Rendez-les TRÈS SPÉCIFIQUES et ACTIONNABLES
- Les catégories doivent être: skincare, haircare, routine, shopping, review ou social
- Variez les catégories
- Mettez des emojis pertinents
- Points: tâches simples (15-20), complexes (30-40), très impliquantes (45-50)
- discountPoints: Points de réduction au panier (0-25)
  - Tâches simples: 3-8 points
  - Tâches complexes: 10-15 points
  - Tâches shopping/review: 15-25 points (plus élevé)
- Les tâches shopping et review doivent avoir les discountPoints les plus élevés`;

    console.log('  Appel API Gemini pour génération tâches...');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout API Gemini (>10s)')), 10000)
    );
    
    const result = await Promise.race([
      generativeModel.generateContent(prompt),
      timeoutPromise
    ]);
    
    const text = result.response.text();
    console.log('✅ Réponse reçue, parsing JSON...');
    
    // Extraire et parser le JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ JSON invalide dans la réponse, utilisation du fallback');
      return generateTasksFallback(skinProfile, hairProfile);
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      console.warn('⚠️ Structure JSON invalide, utilisation du fallback');
      return generateTasksFallback(skinProfile, hairProfile);
    }
    
    // Valider et nettoyer les tâches
    const validCategories = ['skincare', 'haircare', 'routine', 'shopping', 'review', 'social'];
    const validTasks = parsed.tasks
      .filter(task => task.title && task.description && validCategories.includes(task.category))
      .slice(0, 6)
      .map(task => ({
        title: task.title.substring(0, 100),
        description: task.description.substring(0, 500),
        category: task.category,
        icon: task.icon || '✨',
        points: Math.min(Math.max(task.points || 20, 15), 50),
        discountPoints: Math.min(Math.max(task.discountPoints || 0, 0), 25)
      }));
    
    if (validTasks.length === 0) {
      console.warn('⚠️ Pas de tâches valides générées, utilisation du fallback');
      return generateTasksFallback(skinProfile, hairProfile);
    }
    
    console.log(`✅ ${validTasks.length} tâches générées avec succès`);
    return validTasks;
    
  } catch (error) {
    console.error('❌ Erreur génération tâches Gemini:', error);
    console.error('Message:', error.message);
    console.log('📋 Utilisation du fallback automatique...');
    return generateTasksFallback(skinProfile, hairProfile);
  }
};

/**
 * Génère les tâches de fallback intelligemment basées sur le profil
 * @param {Object} skinProfile - Profil de peau
 * @param {Object} hairProfile - Profil de cheveux
 * @returns {Array} Tâches générées
 */
const generateTasksFallback = (skinProfile, hairProfile) => {
  const tasks = [];
  const skinType = skinProfile.skinType.toLowerCase();
  const hairType = hairProfile.hairType.toLowerCase();
  const skinConcerns = skinProfile.skinConcerns.map(c => c.toLowerCase());
  const hairConcerns = hairProfile.hairConcerns.map(c => c.toLowerCase());
  const skinGoals = skinProfile.skinGoals.map(g => g.toLowerCase());
  const hairGoals = hairProfile.hairGoals.map(g => g.toLowerCase());

  // Tâche routine basée sur le type de peau
  if (skinConcerns.includes('acné') || skinConcerns.includes('bouton')) {
    tasks.push({
      title: '🧼 Établir une routine anti-acné',
      description: `Créez une routine quotidienne adaptée à votre peau ${skinType}. Nettoyez matin et soir, appliquez un traitement ciblé anti-acné, et utilisez une crème hydratante légère. Tenez un journal pour suivre les améliorations.`,
      category: 'routine',
      icon: '🧼',
      points: 25,
      discountPoints: 8
    });
  } else if (skinConcerns.includes('rides') || skinConcerns.includes('anti-âge')) {
    tasks.push({
      title: '⏳ Routine anti-âge personnalisée',
      description: `Mettez en place une routine anti-rides adaptée à votre peau ${skinType}. Incluez un nettoyant, un sérum anti-âge, et une crème riche. Utilisez également un SPF tous les jours pour prévenir d'autres dommages.`,
      category: 'routine',
      icon: '⏳',
      points: 30,
      discountPoints: 10
    });
  } else {
    tasks.push({
      title: '✨ Routine beauté quotidienne',
      description: `Créez votre routine beauté personnalisée avec des produits adaptés à votre peau ${skinType}. Commencez par un nettoyage matin et soir, suivi d'une hydratation appropriée. Tenez-vous-y pendant au moins 2 semaines.`,
      category: 'routine',
      icon: '✨',
      points: 20,
      discountPoints: 6
    });
  }

  // Tâche soins cheveux basée sur le type
  if (hairConcerns.includes('chute') || hairConcerns.includes('casse')) {
    tasks.push({
      title: '💪 Traitement fortifiant pour cheveux',
      description: `Intégrez un traitement fortifiant hebdomadaire pour ${hairType.toLowerCase()} cheveux. Appliquez un masque riche, laissez reposer 15-20 minutes, puis rincez. Remarquez comment vos cheveux deviennent plus forts et résistants.`,
      category: 'haircare',
      icon: '💪',
      points: 25,
      discountPoints: 8
    });
  } else if (hairConcerns.includes('sécheresse') || hairGoals.includes('hydratation')) {
    tasks.push({
      title: '💧 Hydratation profonde pour cheveux',
      description: `Mettez en place une routine d'hydratation intensive pour vos cheveux ${hairType}. Utilisez un après-shampooing nourrissant et un masque hydratant une fois par semaine. Vos cheveux seront plus brillants et soyeux.`,
      category: 'haircare',
      icon: '💧',
      points: 25,
      discountPoints: 8
    });
  } else {
    tasks.push({
      title: '✨ Routine cheveux personnalisée',
      description: `Établissez une routine de soin des cheveux adaptée à vos cheveux ${hairType}. Choisissez un shampooing et un après-shampooing appropriés, et ajoutez un traitement hebdomadaire. Observez les résultats en 3-4 semaines.`,
      category: 'haircare',
      icon: '✨',
      points: 20,
      discountPoints: 6
    });
  }

  // Tâche shopping basée sur les objectifs
  if (skinGoals.includes('hydratation')) {
    tasks.push({
      title: '🛍️ Trouver les bons produits hydratants',
      description: 'Explorez notre sélection de produits hydratants adaptés à votre peau. Comparez les avis et les prix, puis sélectionnez vos favoris. Une bonne hydratation est la clé d\'une peau saine.',
      category: 'shopping',
      icon: '🛍️',
      points: 15,
      discountPoints: 18
    });
  } else if (skinGoals.includes('anti-acné')) {
    tasks.push({
      title: '🛍️ Construire votre arsenal anti-acné',
      description: 'Trouvez les meilleurs produits anti-acné pour votre type de peau. Cherchez des nettoyants, des sérums ciblés et des crèmes légères. Lisez les avis pour faire les meilleurs choix.',
      category: 'shopping',
      icon: '🛍️',
      points: 15,
      discountPoints: 18
    });
  } else {
    tasks.push({
      title: '🛍️ Découvrir des produits personnalisés',
      description: 'Parcourez notre catalogue et découvrez de nouveaux produits adaptés à votre profil. Lisez les descriptions et avis pour trouver vos indispensables beauté.',
      category: 'shopping',
      icon: '🛍️',
      points: 15,
      discountPoints: 18
    });
  }

  // Tâche review
  tasks.push({
    title: '⭐ Partager votre expérience produit',
    description: 'Achetez ou testez un produit et partagez votre avis honnête. Les avis détaillés aident d\'autres utilisateurs. Décrivez la texture, l\'efficacité et vos impressions globales.',
    category: 'review',
    icon: '⭐',
    points: 20,
    discountPoints: 20
  });

  // Tâche sociale
  tasks.push({
    title: '👥 Rejoindre la communauté beauté',
    description: 'Connectez-vous avec d\'autres passionnés de beauté! Partagez vos conseils, posez des questions et échangez des recommandations. La communauté est là pour s\'entraide.',
    category: 'social',
    icon: '👥',
    points: 15,
    discountPoints: 8
  });

  return tasks;
};

/**
 * Génère des conseils IA pour une tâche
 * @param {Object} task - L'objet tâche avec title, description, category
 * @returns {Promise<string>} Conseils générés
 */
exports.generateTaskAdvice = async (task) => {
  try {
    console.log('💡 Génération de conseils pour tâche:', task.title);
    
    const generativeModel = initializeModel();
    if (!generativeModel) {
      console.warn('⚠️ Modèle IA non disponible, utilisation du fallback');
      return generateTaskAdviceFallback(task);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY non configurée, utilisation du fallback');
      return generateTaskAdviceFallback(task);
    }

    const prompt = `Tu es un expert en conseils beauté et bien-être. Fournis des conseils pratiques et détaillés pour cette tâche beauté:

Titre: ${task.title}
Description: ${task.description}
Catégorie: ${task.category}

Donne 3-4 conseils TRÈS SPÉCIFIQUES et ACTIONABLES pour réussir cette tâche.
Format: Liste avec des conseils numérotés, chacun de 1-2 phrases maximum.
Sois encourageant et professionnel.`;

    console.log('Appel API Gemini pour conseils...');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout API Gemini (>10s)')), 10000)
    );
    
    const result = await Promise.race([
      generativeModel.generateContent(prompt),
      timeoutPromise
    ]);
    
    const text = result.response.text();
    console.log('✅ Conseils générés avec succès');
    
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Conseils vides, utilisation du fallback');
      return generateTaskAdviceFallback(task);
    }

    return text;
  } catch (error) {
    console.error('❌ Erreur génération conseils:', error);
    console.log('📋 Utilisation du fallback automatique...');
    return generateTaskAdviceFallback(task);
  }
};

/**
 * Fallback pour les conseils des tâches
 * Génère des conseils spécifiques basés sur l'analyse du titre et de la description
 * @param {Object} task - L'objet tâche
 * @returns {string} Conseils générés intelligemment
 */
const generateTaskAdviceFallback = (task) => {
  const category = task.category?.toLowerCase() || '';
  const title = task.title?.toLowerCase() || '';
  const description = task.description?.toLowerCase() || '';
  const fullText = `${title} ${description}`.toLowerCase();
  
  // Analyse intelligente du titre et description pour générer des conseils spécifiques
  const generateSpecificAdvice = () => {
    const adviceList = [];
    
    // Conseils basés sur les mots-clés détectés
    if (fullText.includes('nettoy') || fullText.includes('démaquillant')) {
      adviceList.push('Utilisez un démaquillant adapté à votre type de peau et prenez 1-2 minutes pour bien nettoyer.');
    }
    if (fullText.includes('hydrat')) {
      adviceList.push('Appliquez généreusement sur peau humide pour une meilleure absorption de l\'hydratation.');
    }
    if (fullText.includes('sérum')) {
      adviceList.push('Appliquez le sérum sur peau sèche, tapotez doucement et laissez sécher quelques minutes avant la crème.');
    }
    if (fullText.includes('masque')) {
      adviceList.push('Laissez poser le masque 10-20 minutes selon le type (tissu ou crème) pour une efficacité optimale.');
    }
    if (fullText.includes('exfoliant') || fullText.includes('gommage')) {
      adviceList.push('Utilisez 1-2 fois par semaine maximum pour éviter d\'irriter votre peau.');
    }
    if (fullText.includes('spf') || fullText.includes('soleil') || fullText.includes('protection')) {
      adviceList.push('Appliquez généreusement matin et soir pour une protection maximale contre les UV.');
    }
    if (fullText.includes('cheveux') || fullText.includes('shampoing')) {
      adviceList.push('Mouillez bien vos cheveux, appliquez le produit et massez pendant 2-3 minutes.');
    }
    if (fullText.includes('après-shampoing') || fullText.includes('apres-shampoing')) {
      adviceList.push('Appliquez principalement sur les pointes en évitant le cuir chevelu.');
    }
    if (fullText.includes('traitement') || fullText.includes('soin')) {
      adviceList.push('Pour des résultats optimaux, utilisez régulièrement pendant au moins 4 semaines.');
    }
    if (fullText.includes('avis') || fullText.includes('test') || fullText.includes('essai')) {
      adviceList.push('Donnez votre feedback honnête pour aider la communauté à trouver les meilleurs produits.');
    }
    if (fullText.includes('routine')) {
      adviceList.push('Établissez une routine constante le matin et le soir pour des résultats visibles.');
    }
    if (fullText.includes('acné') || fullText.includes('bouton')) {
      adviceList.push('Évitez de toucher votre visage et soyez patient - l\'amélioration prend généralement 2-3 semaines.');
    }
    if (fullText.includes('rides') || fullText.includes('anti-âge')) {
      adviceList.push('La constance est clé - utilisez le produit quotidiennement pour des résultats anti-âge visibles.');
    }
    if (fullText.includes('brillance') || fullText.includes('éclat')) {
      adviceList.push('Complétez avec une bonne hydratation pour un éclat naturel et sain.');
    }
    if (fullText.includes('cheveux gras') || fullText.includes('cheveu gras')) {
      adviceList.push('Lavez vos cheveux 2-3 fois par semaine pour réguler la production de sébum.');
    }
    if (fullText.includes('cheveux secs') || fullText.includes('cheveu sec')) {
      adviceList.push('Utilisez des produits riches en huiles et évitez l\'eau trop chaude.');
    }
    
    // Si on a assez de conseils spécifiques, les retourner
    if (adviceList.length >= 3) {
      return adviceList.slice(0, 4).map((advice, i) => `${i + 1}. ${advice}`).join('\n');
    }
    
    // Sinon, retourner des conseils généraux
    return `1. Commencez doucement: Si c'est la première fois, introduisez graduellement cette tâche dans votre routine.
2. Soyez patient: Les bons résultats demandent du temps et de la persévérance.
3. Observez les résultats: Notez les changements et ajustez votre approche selon vos observations.
4. Amusez-vous: Prenez du plaisir dans votre routine beauté - c'est aussi important que l'efficacité!`;
  };
  
  return generateSpecificAdvice();
};
