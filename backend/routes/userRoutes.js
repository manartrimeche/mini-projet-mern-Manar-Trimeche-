const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

// Routes publiques (juste GET all)
router.get('/', getAllUsers);

// Route pour mettre à jour le profil de l'utilisateur connecté
router.put('/profile', protect, updateProfile);

// Routes pour les adresses
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

// Routes privées
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

// Wishlist routes
router.get('/:id/wishlist', protect, getWishlist);
router.post('/:id/wishlist/:productId', protect, addToWishlist);
router.delete('/:id/wishlist/:productId', protect, removeFromWishlist);

module.exports = router;
