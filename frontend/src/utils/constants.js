export const APP_NAME = 'StockPilot';

// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Pagination
export const ITEMS_PER_PAGE = 20;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'stock_in',
  STOCK_OUT: 'stock_out',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  DAMAGE: 'damage',
};

// Stock Status
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
};

// Purchase Order Status
export const PO_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  REORDER: 'reorder',
  PO_UPDATE: 'po_update',
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
};

// Default Units
export const PRODUCT_UNITS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'ltr', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'unit', label: 'Unit' },
];

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

export default {
  APP_NAME,
  API_BASE_URL,
  ITEMS_PER_PAGE,
  USER_ROLES,
  TRANSACTION_TYPES,
  STOCK_STATUS,
  PO_STATUS,
  NOTIFICATION_TYPES,
  CHART_COLORS,
  PRODUCT_UNITS,
  DATE_FORMAT,
  DATETIME_FORMAT,
};
