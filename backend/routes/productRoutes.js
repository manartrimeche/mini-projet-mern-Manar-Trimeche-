const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  deleteOutOfStockProducts
} = require('../controllers/productController');

// Routes publiques
router.get('/', getAllProducts);
router.get('/search/:query', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// Routes privées (Admin)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Route pour supprimer les produits en rupture
router.delete('/cleanup/out-of-stock', deleteOutOfStockProducts);

module.exports = router;
