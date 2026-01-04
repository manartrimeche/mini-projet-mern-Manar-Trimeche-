const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Routes publiques
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Routes privées (Admin) - À protéger avec middleware plus tard
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
