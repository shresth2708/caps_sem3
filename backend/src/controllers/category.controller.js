const prisma = require('../config/database');

// @desc    Get all categories
const getAllCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause for search
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          parentId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
      }),
      prisma.category.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        categories,
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

// @desc    Get single category with products
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            sku: true,
            name: true,
            quantity: true,
            price: true,
            minStockLevel: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
const createCategory = async (req, res, next) => {
  try {
    const categoryData = req.validatedData;

    const category = await prisma.category.create({
      data: categoryData,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.validatedData;

    const category = await prisma.category.update({
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
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CATEGORY_HAS_PRODUCTS',
          message: 'Cannot delete category with associated products. Please reassign or delete products first.'
        }
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
