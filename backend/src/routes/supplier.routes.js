const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, supplierSchema } = require('../utils/validators');

router.use(authenticate);

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', supplierController.getAllSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get single supplier with products
// @access  Private
router.get('/:id', supplierController.getSupplierById);

// @route   POST /api/suppliers
// @desc    Create new supplier
// @access  Private (Any authenticated user)
router.post('/', validate(supplierSchema), supplierController.createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Update supplier
// @access  Private (Any authenticated user)
router.put('/:id', validate(supplierSchema), supplierController.updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete supplier
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), supplierController.deleteSupplier);

module.exports = router;
