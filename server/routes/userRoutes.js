const express = require('express');
const { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  uploadProfilePicture
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', upload.single('profilePicture'), registerUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('profilePicture'), updateUserProfile);

// Upload profile picture only
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Keep this for backward compatibility if needed
router.post('/', upload.single('profilePicture'), registerUser);

module.exports = router;