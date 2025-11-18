import api from './api';

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get chart data
  getChartData: async () => {
    const response = await api.get('/dashboard/charts');
    return response.data;
  },

  // Get recent activity
  getRecentActivity: async (limit = 20) => {
    const response = await api.get('/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardService;
