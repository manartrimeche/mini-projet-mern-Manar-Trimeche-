const Category = require('../models/Category');

// DESC: Récupérer toutes les catégories
// ROUTE: GET /api/categories
// ACCESS: Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('products', 'name price image'); // Populate les produits

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: error.message
    });
  }
};

// DESC: Récupérer une catégorie par ID
// ROUTE: GET /api/categories/:id
// ACCESS: Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('products'); // Tous les produits de cette catégorie

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: error.message
    });
  }
};

// DESC: Créer une nouvelle catégorie
// ROUTE: POST /api/categories
// ACCESS: Private (Admin seulement - à ajouter plus tard)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Cette catégorie existe déjà'
      });
    }

    // Créer la catégorie
    const category = await Category.create({
      name,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: error.message
    });
  }
};

// DESC: Mettre à jour une catégorie
// ROUTE: PUT /api/categories/:id
// ACCESS: Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Mettre à jour les champs fournis
    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Retourner le doc mis à jour
    );

    res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// DESC: Supprimer une catégorie
// ROUTE: DELETE /api/categories/:id
// ACCESS: Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};
