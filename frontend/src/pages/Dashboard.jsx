import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { overview, alerts } = stats || {};

  const statCards = [
    {
      title: 'Total Products',
      value: formatNumber(overview?.totalProducts || 0),
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/products',
    },
    {
      title: 'Total Suppliers',
      value: formatNumber(overview?.totalSuppliers || 0),
      icon: Truck,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '/suppliers',
    },
    {
      title: 'Low Stock Items',
      value: formatNumber(overview?.lowStockCount || 0),
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      link: '/products?status=low_stock',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(overview?.inventoryValue || 0),
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your inventory overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View details
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
            <Link
              to="/products?status=low_stock"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {alerts?.lowStockProducts?.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-800">
                    {product.quantity} / {product.minStockLevel}
                  </p>
                  <p className="text-xs text-gray-600">Current / Min</p>
                </div>
              </div>
            ))}
            {(!alerts?.lowStockProducts || alerts.lowStockProducts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-2 text-gray-400" />
                <p>No low stock items</p>
              </div>
            )}
          </div>
        </div>

        {/* Out of Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Out of Stock</h2>
            <Link
              to="/products?status=out_of_stock"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {alerts?.outOfStockProducts?.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                </div>
                <span className="badge badge-danger">Out of Stock</span>
              </div>
            ))}
            {(!alerts?.outOfStockProducts || alerts.outOfStockProducts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto mb-2 text-gray-400" />
                <p>All products in stock</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/products"
            className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
          >
            <Package className="text-primary-600 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-600">Create new product</p>
            </div>
          </Link>
          <Link
            to="/transactions"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <TrendingUp className="text-green-600 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900">Stock In</p>
              <p className="text-sm text-gray-600">Record stock receipt</p>
            </div>
          </Link>
          <Link
            to="/purchase-orders"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <Truck className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-900">Purchase Order</p>
              <p className="text-sm text-gray-600">Create new PO</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
