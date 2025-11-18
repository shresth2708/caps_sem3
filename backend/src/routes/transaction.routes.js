const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth');
const { validate, transactionSchema } = require('../utils/validators');

router.use(authenticate);

// @route   GET /api/transactions
// @desc    Get all transactions with filters
// @access  Private
router.get('/', transactionController.getAllTransactions);

// @route   GET /api/transactions/product/:productId
// @desc    Get transactions for specific product
// @access  Private
router.get('/product/:productId', transactionController.getProductTransactions);

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private
router.get('/stats', transactionController.getTransactionStats);

// @route   POST /api/transactions
// @desc    Create new transaction (stock in/out/adjustment)
// @access  Private
router.post('/', validate(transactionSchema), transactionController.createTransaction);

module.exports = router;
