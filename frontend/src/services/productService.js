import api from './api';

export const productService = {
  // Get all products with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get low stock products
  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  // Get product stats
  getStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },

  // Generate QR code
  generateQRCode: async (id) => {
    const response = await api.get(`/products/${id}/qrcode`);
    return response.data;
  },
};

export default productService;
