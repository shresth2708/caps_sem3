const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/stats', dashboardController.getDashboardStats);

// @route   GET /api/dashboard/charts
// @desc    Get data for dashboard charts
// @access  Private
router.get('/charts', dashboardController.getChartData);

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent transactions
// @access  Private
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
