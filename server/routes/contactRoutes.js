const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  submitContactForm,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  getStats
} = require('../controllers/contactController');

// Public routes
router.post('/', submitContactForm);

// Admin routes
router.get('/', protect, admin, getMessages);
router.get('/stats', protect, admin, getStats);
router.put('/:id/status', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;