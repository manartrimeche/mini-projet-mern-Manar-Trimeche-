const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  markOrderAsPaid,
  deleteOrder,
  getOrderItems
} = require('../controllers/orderController');

// Routes privées (utilisateur connecté)
router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/items', protect, getOrderItems);
router.put('/:id/pay', protect, markOrderAsPaid);
router.delete('/:id', protect, deleteOrder);

// Routes admin (à protéger avec un middleware admin plus tard)
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
