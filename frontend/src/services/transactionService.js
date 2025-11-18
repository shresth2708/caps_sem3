import api from './api';

export const transactionService = {
  // Get all transactions with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get transactions for specific product
  getByProduct: async (productId) => {
    const response = await api.get(`/transactions/product/${productId}`);
    return response.data;
  },

  // Create transaction
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Get transaction statistics
  getStats: async (params = {}) => {
    const response = await api.get('/transactions/stats', { params });
    return response.data;
  },
};

export default transactionService;