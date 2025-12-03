const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, categorySchema } = require('../utils/validators');

router.use(authenticate);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', categoryController.getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get single category with products
// @access  Private
router.get('/:id', categoryController.getCategoryById);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Any authenticated user)
router.post('/', validate(categorySchema), categoryController.createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Any authenticated user)
router.put('/:id', validate(categorySchema), categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), categoryController.deleteCategory);

module.exports = router;
