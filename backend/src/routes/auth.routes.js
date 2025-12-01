const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, userSignupSchema, userLoginSchema } = require('../utils/validators');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', validate(userSignupSchema), authController.signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(userLoginSchema), authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user (optional - for token blacklisting if implemented)
// @access  Private
router.post('/logout', authenticate, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, authController.getCurrentUser);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
const { authorize } = require('../middleware/auth');
router.get('/users', authorize('admin'), authController.getAllUsers);

// @route   POST /api/auth/users
// @desc    Create new user (Admin only)
// @access  Private (Admin)
router.post('/users', authorize('admin'), validate(userSignupSchema), authController.createUser);

// @route   PUT /api/auth/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/users/:id', authorize('admin'), authController.updateUser);

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', authorize('admin'), authController.deleteUser);

module.exports = router;
