const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, productSchema } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// @route   GET /api/products
// @desc    Get all products with pagination and filters
// @access  Private
router.get('/', productController.getAllProducts);

// @route   GET /api/products/low-stock
// @desc    Get low stock products
// @access  Private
router.get('/low-stock', productController.getLowStockProducts);

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Private
router.get('/stats', productController.getProductStats);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Private
router.get('/:id', productController.getProductById);

// @route   GET /api/products/:id/qrcode
// @desc    Generate QR code for product
// @access  Private
router.get('/:id/qrcode', productController.generateProductQRCode);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Any authenticated user)
router.post('/', validate(productSchema), productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Any authenticated user)
router.put('/:id', validate(productSchema), productController.updateProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock quantity
// @access  Private (User & Admin - PRD specification)
router.patch('/:id/stock', productController.updateProductStock);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), productController.deleteProduct);

module.exports = router;
