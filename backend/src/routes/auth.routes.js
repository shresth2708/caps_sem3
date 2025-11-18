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

module.exports = router;
