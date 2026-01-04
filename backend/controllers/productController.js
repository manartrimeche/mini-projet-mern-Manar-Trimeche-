const Product = require('../models/Product');
const Category = require('../models/Category');

// DESC: Récupérer tous les produits
// ROUTE: GET /api/products
// ACCESS: Public
exports.getAllProducts = async (req, res) => {
  try {
    // Pagination optionnelle
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    // Filtres
    const { search, category, minPrice, maxPrice, rating } = req.query;
    
    let query = {};
    
    // Filtre de recherche (nom ou description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par catégorie
    if (category) {
      query.categories = category;
    }
    
    // Filtre par prix
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filtre par rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const products = await Product.find(query)
      .populate('categories', 'name')
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total: total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// DESC: Récupérer un produit par ID
// ROUTE: GET /api/products/:id
// ACCESS: Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categories'); // Juste les catégories pour l'instant

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// DESC: Créer un nouveau produit
// ROUTE: POST /api/products
// ACCESS: Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image, brand, categories } = req.body;

    // Validation
    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nom, description et prix sont requis'
      });
    }

    // Vérifier que les catégories existent
    if (categories && categories.length > 0) {
      const validCategories = await Category.find({ _id: { $in: categories } });
      if (validCategories.length !== categories.length) {
        return res.status(400).json({
          success: false,
          message: 'Une ou plusieurs catégories n\'existent pas'
        });
      }
    }

    // Créer le produit
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      image,
      brand,
      categories
    });

    // Ajouter le produit aux catégories (Many-to-Many)
    if (categories && categories.length > 0) {
      await Category.updateMany(
        { _id: { $in: categories } },
        { $push: { products: product._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// DESC: Mettre à jour un produit
// ROUTE: PUT /api/products/:id
// ACCESS: Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Mettre à jour
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// DESC: Supprimer un produit
// ROUTE: DELETE /api/products/:id
// ACCESS: Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Supprimer le produit des catégories
    await Category.updateMany(
      { _id: { $in: product.categories } },
      { $pull: { products: product._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// DESC: Récupérer les produits d'une catégorie
// ROUTE: GET /api/products/category/:categoryId
// ACCESS: Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ categories: req.params.categoryId })
      .populate('categories')
      .populate('reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// DESC: Rechercher des produits
// ROUTE: GET /api/products/search/:query
// ACCESS: Public
exports.searchProducts = async (req, res) => {
  try {
    const query = req.params.query;

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ]
    }).populate('categories');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};
// DESC: Supprimer les produits en rupture de stock
// ROUTE: DELETE /api/products/cleanup/out-of-stock
// ACCESS: Private (Admin)
exports.deleteOutOfStockProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({ stock: 0 });

    res.status(200).json({
      success: true,
      message: `✅ ${result.deletedCount} produit(s) en rupture supprimé(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression des produits',
      error: error.message
    });
  }
};