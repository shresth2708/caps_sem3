import api from './api';

export const purchaseOrderService = {
  // Get all purchase orders with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get('/purchase-orders', { params });
    return response.data;
  },

  // Get single purchase order
  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  // Create purchase order
  create: async (purchaseOrderData) => {
    const response = await api.post('/purchase-orders', purchaseOrderData);
    return response.data;
  },

  // Update purchase order status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel purchase order
  cancel: async (id) => {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response.data;
  },
};

export default purchaseOrderService;