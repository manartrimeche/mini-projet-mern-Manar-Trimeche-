const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getUserTasks,
  getTaskById,
  updateTaskProgress,
  completeTask,
  deleteTask,
  cleanExpiredTasks
} = require('../controllers/taskController');

// Routes protégées
router.get('/clean', protect, cleanExpiredTasks);
router.get('/', protect, getUserTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id/progress', protect, updateTaskProgress);
router.post('/:id/complete', protect, completeTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
