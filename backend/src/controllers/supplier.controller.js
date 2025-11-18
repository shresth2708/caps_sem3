const prisma = require('../config/database');

// @desc    Get all suppliers
const getAllSuppliers = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      }),
      prisma.supplier.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        suppliers,
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

// @desc    Get single supplier with products
const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            quantity: true,
            unitPrice: true,
            minStockLevel: true
          }
        },
        _count: {
          select: { products: true, purchaseOrders: true }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUPPLIER_NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new supplier
const createSupplier = async (req, res, next) => {
  try {
    const supplierData = req.validatedData;

    const supplier = await prisma.supplier.create({
      data: supplierData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete supplier
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete
    await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
