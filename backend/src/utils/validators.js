const Joi = require('joi');

// User validation schemas
const userSignupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  role: Joi.string().valid('admin', 'user').default('user')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  sku: Joi.string().optional().allow(''),
  description: Joi.string().max(1000).optional().allow(''),
  category: Joi.string().min(1).max(100).optional().allow(''),
  categoryId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow(''),
    Joi.valid(null)
  ).optional(),
  supplierId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow(''),
    Joi.valid(null)
  ).optional(),
  price: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().optional().allow(null),
  sellingPrice: Joi.number().positive().optional().allow(null),
  quantity: Joi.number().integer().min(0).required(),
  minStockLevel: Joi.number().integer().min(0).default(10),
  reorderPoint: Joi.number().integer().min(0).default(10),
  reorderQuantity: Joi.number().integer().min(1).default(50),
  unit: Joi.string().default('pcs'),
  barcode: Joi.string().optional().allow(''),
  imageUrl: Joi.string().uri().optional().allow(''),
  expiryDate: Joi.date().optional().allow(null),
  batchNumber: Joi.string().optional().allow('')
});

// Supplier validation schema
const supplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  contact: Joi.string().max(200).optional().allow(''),
  company: Joi.string().max(200).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  paymentTerms: Joi.string().max(200).optional().allow(''),
  leadTimeDays: Joi.number().integer().min(0).default(7)
});

// Transaction validation schema
const transactionSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  type: Joi.string().valid('stock_in', 'stock_out', 'adjustment', 'return', 'damage').required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().optional().allow(null),
  notes: Joi.string().max(500).optional().allow(''),
  referenceNo: Joi.string().max(100).optional().allow('')
});

// Category validation schema
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  icon: Joi.string().max(50).optional().allow(''),
  parentId: Joi.number().integer().positive().optional().allow(null)
});

// Purchase Order validation schema
const purchaseOrderSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().required(),
  expectedDate: Joi.date().optional().allow(null),
  notes: Joi.string().max(500).optional().allow('')
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    console.log('Validating request body:', req.body);
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.log('Validation error:', error.details);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details
        }
      });
    }

    req.validatedData = value;
    console.log('Validation successful:', value);
    next();
  };
};

module.exports = {
  validate,
  userSignupSchema,
  userLoginSchema,
  productSchema,
  supplierSchema,
  transactionSchema,
  categorySchema,
  purchaseOrderSchema
};
