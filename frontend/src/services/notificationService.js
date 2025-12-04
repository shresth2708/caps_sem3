import api from './api';

export const notificationService = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get('/notifications', {
      params: { unreadOnly: true, limit: 1 }
    });
    return response.data.data.unreadCount;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Generate sample notifications (for testing)
  generateSamples: async () => {
    const response = await api.post('/notifications/generate-samples');
    return response.data;
  },

  // Get notification types for filtering
  getNotificationTypes: () => {
    return [
      { value: 'low_stock', label: 'Low Stock Alert', color: 'yellow' },
      { value: 'out_of_stock', label: 'Out of Stock Alert', color: 'red' },
      { value: 'reorder_point', label: 'Reorder Point Alert', color: 'orange' },
      { value: 'expiry_warning', label: 'Expiry Warning', color: 'amber' },
      { value: 'new_order', label: 'New Order', color: 'blue' },
      { value: 'order_delivered', label: 'Order Delivered', color: 'green' },
      { value: 'system', label: 'System Notification', color: 'gray' }
    ];
  }
};

export default notificationService;