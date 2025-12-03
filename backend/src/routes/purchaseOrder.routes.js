const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, purchaseOrderSchema } = require('../utils/validators');

router.use(authenticate);

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get('/', purchaseOrderController.getAllPurchaseOrders);

// @route   GET /api/purchase-orders/:id
// @desc    Get single purchase order
// @access  Private
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

// @route   POST /api/purchase-orders
// @desc    Create new purchase order
// @access  Private (Any authenticated user)
router.post('/', validate(purchaseOrderSchema), purchaseOrderController.createPurchaseOrder);

// @route   PATCH /api/purchase-orders/:id/status
// @desc    Update purchase order status
// @access  Private (Any authenticated user)
router.patch('/:id/status', purchaseOrderController.updatePurchaseOrderStatus);

// @route   DELETE /api/purchase-orders/:id
// @desc    Cancel purchase order
// @access  Private (Any authenticated user)
router.delete('/:id', purchaseOrderController.cancelPurchaseOrder);

module.exports = router;
