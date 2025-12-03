const prisma = require('../config/database');

// @desc    Get all transactions with filters
const getAllTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      type,
      productId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(type && { type }),
      ...(productId && { productId: parseInt(productId) }),
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
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
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
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

// @desc    Get transactions for specific product
const getProductTransactions = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
const createTransaction = async (req, res, next) => {
  try {
    const { productId, type, quantity, unitPrice, notes, referenceNo } = req.validatedData;

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const beforeQty = product.quantity;
    let afterQty = beforeQty;

    // Calculate new quantity based on transaction type
    switch (type) {
      case 'stock_in':
      case 'return':
        afterQty = beforeQty + quantity;
        break;
      case 'stock_out':
      case 'damage':
        if (beforeQty < quantity) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: 'Insufficient stock for this transaction'
            }
          });
        }
        afterQty = beforeQty - quantity;
        break;
      case 'adjustment':
        afterQty = quantity; // Direct quantity adjustment
        break;
    }

    // Create transaction and update product in a transaction
    const [transaction, updatedProduct] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          productId,
          userId: req.user.id,
          type,
          quantity: type === 'adjustment' ? quantity : Math.abs(quantity),
          beforeQty,
          afterQty,
          unitPrice: unitPrice || product.price,
          totalValue: (unitPrice || product.price) * Math.abs(quantity),
          notes,
          referenceNo
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
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.product.update({
        where: { id: productId },
        data: { quantity: afterQty }
      })
    ]);

    // Create notification if stock is low or out
    if (afterQty <= product.minStockLevel) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: afterQty === 0 ? 'out_of_stock' : 'low_stock',
          title: afterQty === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
          message: `Product "${product.name}" is ${afterQty === 0 ? 'out of stock' : 'running low'} after ${type} transaction`,
          productId: product.id,
          link: `/products/${product.id}`
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: {
        transaction,
        updatedQuantity: afterQty
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
const getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [
      totalTransactions,
      stockInCount,
      stockOutCount,
      adjustmentCount
    ] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, type: 'stock_in' } }),
      prisma.transaction.count({ where: { ...where, type: 'stock_out' } }),
      prisma.transaction.count({ where: { ...where, type: 'adjustment' } })
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        stockInCount,
        stockOutCount,
        adjustmentCount,
        returnCount: await prisma.transaction.count({ where: { ...where, type: 'return' } }),
        damageCount: await prisma.transaction.count({ where: { ...where, type: 'damage' } })
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTransactions,
  getProductTransactions,
  createTransaction,
  getTransactionStats
};
