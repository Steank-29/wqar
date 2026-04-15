const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Helper function to delete old profile picture
const deleteOldProfilePicture = (picturePath) => {
  if (picturePath && picturePath !== 'default-avatar.jpg' && picturePath !== 'default-avatar.png') {
    const fullPath = path.join(__dirname, '..', picturePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        token: user.getSignedJwtToken()
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      dateOfBirth, 
      gender, 
      phoneNumber 
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      // Delete uploaded file if user already exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Handle profile picture path
    let profilePicture = 'default-avatar.jpg'; // Default avatar
    if (req.file) {
      profilePicture = req.file.path;
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      gender,
      phoneNumber,
      profilePicture: profilePicture
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        token: user.getSignedJwtToken()
      });
    } else {
      // Delete uploaded file if user creation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Handle profile picture update
      if (req.file) {
        // Delete old profile picture if it's not default
        deleteOldProfilePicture(user.profilePicture);
        user.profilePicture = req.file.path;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        phoneNumber: updatedUser.phoneNumber,
        token: updatedUser.getSignedJwtToken()
      });
    } else {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload profile picture only
// @route   POST /api/users/upload-profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      // Delete old profile picture
      deleteOldProfilePicture(user.profilePicture);
      user.profilePicture = req.file.path;
      await user.save();
      
      res.json({
        message: 'Profile picture updated successfully',
        profilePicture: user.profilePicture
      });
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
};