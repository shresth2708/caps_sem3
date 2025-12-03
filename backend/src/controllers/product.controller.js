const prisma = require('../config/database');
const { generateQRCode, generateQRCodeBuffer } = require('../utils/qrGenerator');

// @desc    Get all products with pagination and filters
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      supplier,
      status, // 'in_stock', 'low_stock', 'out_of_stock'
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { categoryId: parseInt(category) }),
      ...(supplier && { supplierId: parseInt(supplier) })
    };

    // Add status filter
    if (status === 'out_of_stock') {
      where.quantity = 0;
    } else if (status === 'low_stock') {
      where.quantity = {
        gt: 0,
        lte: 50 // Simple threshold for low stock
      };
    } else if (status === 'in_stock') {
      where.quantity = { gt: 50 };
    }

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          categoryRef: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              contact: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
      }),
      prisma.product.count({ where })
    ]);

    // Add stock status to each product
    const productsWithStatus = products.map(product => ({
      ...product,
      stockStatus: product.quantity === 0 ? 'out_of_stock' :
                   product.quantity <= product.minStockLevel ? 'low_stock' : 'in_stock'
    }));

    res.json({
      success: true,
      data: {
        products: productsWithStatus,
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

// @desc    Get single product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoryRef: true,
        supplier: true,
        transactions: {
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
          take: 10
        }
      }
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

    // Add stock status
    const productWithStatus = {
      ...product,
      stockStatus: product.quantity === 0 ? 'out_of_stock' :
                   product.quantity <= product.minStockLevel ? 'low_stock' : 'in_stock',
      needsReorder: product.quantity <= product.reorderPoint
    };

    res.json({
      success: true,
      data: { product: productWithStatus }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
const createProduct = async (req, res, next) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Validated data:', req.validatedData);
    const productData = req.validatedData;

    // Generate SKU if not provided
    if (!productData.sku || productData.sku.trim() === '') {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8);
      productData.sku = `PRD-${timestamp}-${random}`.toUpperCase();
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        categoryRef: true,
        supplier: true
      }
    });

    // Create notification if stock is low
    if (product.quantity <= product.minStockLevel) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
          title: product.quantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
          message: `Product "${product.name}" is ${product.quantity === 0 ? 'out of stock' : 'running low'}`,
          productId: product.id,
          link: `/products/${product.id}`
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Product creation error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_VALUE',
          message: `A product with this ${field} already exists`
        }
      });
    }
    
    next(error);
  }
};

// @desc    Update product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        categoryRef: true,
        supplier: true
      }
    });

    // Create low stock notification if quantity changed
    if (updateData.quantity !== undefined && product.quantity <= product.minStockLevel) {
      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: product.quantity === 0 ? 'out_of_stock' : 'low_stock',
          title: product.quantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert',
          message: `Product "${product.name}" is ${product.quantity === 0 ? 'out of stock' : 'running low'}`,
          productId: product.id,
          link: `/products/${product.id}`
        }
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
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

    // Soft delete (set isActive to false)
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products
const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        quantity: {
          lte: 50,
          gt: 0
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
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
      },
      orderBy: { quantity: 'asc' }
    });

    const outOfStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        quantity: 0
      },
      include: {
        category: true,
        supplier: true
      }
    });

    res.json({
      success: true,
      data: {
        lowStock: products,
        outOfStock: outOfStockProducts,
        lowStockCount: products.length,
        outOfStockCount: outOfStockProducts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product statistics
const getProductStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          quantity: {
            lte: 50,
            gt: 0
          }
        }
      }),
      prisma.product.count({
        where: {
          isActive: true,
          quantity: 0
        }
      }),
      prisma.product.aggregate({
        where: { isActive: true },
        _sum: {
          quantity: true
        }
      })
    ]);

    // Calculate total inventory value
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        unitPrice: true,
        quantity: true
      }
    });

    const inventoryValue = products.reduce((sum, product) => {
      return sum + (product.unitPrice * product.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        inStockCount: totalProducts - lowStockCount - outOfStockCount,
        totalInventoryValue: inventoryValue,
        totalQuantity: totalInventoryValue._sum.quantity || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code for product
const generateProductQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        sku: true,
        name: true,
        quantity: true,
        unitPrice: true
      }
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

    // Generate QR code data
    const qrData = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      quantity: product.quantity,
      price: product.unitPrice,
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${product.id}`
    };

    const qrCodeImage = await generateQRCode(qrData);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeImage,
        product: product
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product stock quantity
// @route   PATCH /api/products/:id/stock
// @access  Private (User & Admin)
const updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set', notes } = req.body;

    if (!quantity && quantity !== 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Quantity is required'
        }
      });
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, quantity: true, sku: true }
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

    let newQuantity;
    let transactionType;

    // Calculate new quantity based on operation
    switch (operation) {
      case 'add':
        newQuantity = product.quantity + parseInt(quantity);
        transactionType = 'stock_in';
        break;
      case 'subtract':
        newQuantity = Math.max(0, product.quantity - parseInt(quantity));
        transactionType = 'stock_out';
        break;
      case 'set':
      default:
        newQuantity = parseInt(quantity);
        transactionType = newQuantity > product.quantity ? 'stock_in' : 'stock_out';
        break;
    }

    // Update product quantity and create transaction in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: parseInt(id) },
        data: { quantity: newQuantity },
        include: {
          supplier: true,
          categoryRef: true
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          productId: parseInt(id),
          userId: req.user.id,
          type: transactionType,
          quantity: Math.abs(newQuantity - product.quantity),
          beforeQty: product.quantity,
          afterQty: newQuantity,
          notes: notes || `Stock ${operation} operation`,
          referenceNo: `STOCK-${Date.now()}`
        }
      });

      return updatedProduct;
    });

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: {
        product: result,
        previousQuantity: product.quantity,
        newQuantity: newQuantity,
        operation: operation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductStats,
  generateProductQRCode,
  updateProductStock
};
