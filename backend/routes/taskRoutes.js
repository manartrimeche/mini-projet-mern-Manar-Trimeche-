const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getUserTasks,
  getTaskById,
  updateTaskProgress,
  completeTask,
  deleteTask,
  cleanExpiredTasks,
  getTaskAdvice
} = require('../controllers/taskController');

// Routes protégées
router.get('/clean', protect, cleanExpiredTasks);
router.get('/', protect, getUserTasks);
router.get('/:id', protect, getTaskById);
router.get('/:id/advice', protect, getTaskAdvice);
router.put('/:id/progress', protect, updateTaskProgress);
router.post('/:id/complete', protect, completeTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
