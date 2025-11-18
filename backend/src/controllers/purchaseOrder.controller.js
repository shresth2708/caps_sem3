const prisma = require('../config/database');

// @desc    Get all purchase orders
const getAllPurchaseOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(status && { status })
    };

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              unit: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single purchase order
const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true,
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PURCHASE_ORDER_NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }

    res.json({
      success: true,
      data: { purchaseOrder }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new purchase order
const createPurchaseOrder = async (req, res, next) => {
  try {
    const { productId, supplierId, quantity, unitPrice, expectedDate, notes } = req.validatedData;

    // Verify product and supplier exist
    const [product, supplier] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.supplier.findUnique({ where: { id: supplierId } })
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }

    const totalAmount = quantity * unitPrice;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        productId,
        supplierId,
        userId: req.user.id,
        quantity,
        unitPrice,
        totalAmount,
        expectedDate: expectedDate || null,
        notes
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true
          }
        },
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'po_update',
        title: 'Purchase Order Created',
        message: `Purchase order #${purchaseOrder.orderNumber} created for ${product.name}`,
        productId: product.id,
        link: `/purchase-orders/${purchaseOrder.id}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: { purchaseOrder }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update purchase order status
const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status. Must be one of: pending, approved, delivered, cancelled'
        }
      });
    }

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PURCHASE_ORDER_NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }

    const updateData = {
      status,
      ...(status === 'delivered' && { deliveredDate: new Date() })
    };

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        product: true,
        supplier: true
      }
    });

    // If status is delivered, create stock-in transaction
    if (status === 'delivered') {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            productId: purchaseOrder.productId,
            userId: req.user.id,
            type: 'stock_in',
            quantity: purchaseOrder.quantity,
            beforeQty: purchaseOrder.product.quantity,
            afterQty: purchaseOrder.product.quantity + purchaseOrder.quantity,
            unitPrice: purchaseOrder.unitPrice,
            totalValue: purchaseOrder.totalAmount,
            notes: `Purchase Order #${purchaseOrder.orderNumber} received`,
            referenceNo: purchaseOrder.orderNumber
          }
        }),
        prisma.product.update({
          where: { id: purchaseOrder.productId },
          data: {
            quantity: purchaseOrder.product.quantity + purchaseOrder.quantity
          }
        })
      ]);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'po_update',
        title: 'Purchase Order Updated',
        message: `Purchase order #${purchaseOrder.orderNumber} status changed to ${status}`,
        productId: purchaseOrder.productId,
        link: `/purchase-orders/${purchaseOrder.id}`
      }
    });

    res.json({
      success: true,
      message: 'Purchase order status updated successfully',
      data: { purchaseOrder: updatedPO }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel purchase order
const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: { purchaseOrder }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  cancelPurchaseOrder
};
