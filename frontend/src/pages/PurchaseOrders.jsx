import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, XMarkIcon, CheckIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon, CubeIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import purchaseOrderService from '../services/purchaseOrderService';
import productService from '../services/productService';
import supplierService from '../services/supplierService';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters and pagination
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: '',
    unitPrice: '',
    expectedDate: '',
    notes: ''
  });

  const limit = 20;

  // Status options for filtering
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  // Load purchase orders when filters change
  useEffect(() => {
    loadPurchaseOrders();
  }, [selectedStatus, currentPage]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        status: selectedStatus
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      const response = await purchaseOrderService.getAll(params);
      setPurchaseOrders(response.data.purchaseOrders);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load purchase orders');
      console.error('Error loading purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 1000 });
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ limit: 1000 });
      setSuppliers(response.data.suppliers || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openCreateModal = () => {
    setEditingPO(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (purchaseOrder) => {
    setFormData({
      productId: purchaseOrder.productId?.toString() || '',
      supplierId: purchaseOrder.supplierId?.toString() || '',
      quantity: purchaseOrder.quantity?.toString() || '',
      unitPrice: purchaseOrder.unitPrice?.toString() || '',
      expectedDate: purchaseOrder.expectedDate ? new Date(purchaseOrder.expectedDate).toISOString().split('T')[0] : '',
      notes: purchaseOrder.notes || ''
    });
    setEditingPO(purchaseOrder);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      supplierId: '',
      quantity: '',
      unitPrice: '',
      expectedDate: '',
      notes: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        productId: parseInt(formData.productId),
        supplierId: parseInt(formData.supplierId),
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        expectedDate: formData.expectedDate || null
      };

      if (editingPO) {
        // Note: Update functionality would need to be implemented in backend
        toast.info('Purchase order editing not yet implemented');
      } else {
        const response = await purchaseOrderService.create(submitData);
        if (response.success) {
          toast.success('Purchase order created successfully!');
          setShowModal(false);
          resetForm();
          loadPurchaseOrders();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${editingPO ? 'update' : 'create'} purchase order`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (poId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const response = await purchaseOrderService.updateStatus(poId, newStatus);
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        loadPurchaseOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badgeConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckIcon, label: 'Approved' },
      delivered: { color: 'bg-green-100 text-green-800', icon: TruckIcon, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Cancelled' }
    };

    const config = badgeConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: status };
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadPurchaseOrders}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const productOptions = products.map(product => ({
    value: product.id.toString(),
    label: `${product.name} (${product.sku})`
  }));

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id.toString(),
    label: supplier.name
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        {user && (
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            New Purchase Order
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            selectedValue={selectedStatus}
            onSelect={handleStatusFilter}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <CubeIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              No purchase orders match your current filters.
            </p>
            {user && (
              <button
                onClick={openCreateModal}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create First Purchase Order
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{po.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {po.product?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {po.product?.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {po.supplier?.name}
                        </div>
                        {po.supplier?.phone && (
                          <div className="text-sm text-gray-500">
                            {po.supplier.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {po.quantity} {po.product?.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(po.totalAmount)}
                        </div>
                        <div className="text-sm text-gray-500">
                          @ {formatCurrency(po.unitPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(po.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(po.orderDate)}
                        </div>
                        {po.expectedDate && (
                          <div className="text-sm text-gray-500">
                            Expected: {formatDate(po.expectedDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {po.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(po.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(po.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Cancel"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {po.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(po.id, 'delivered')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Mark as Delivered"
                            >
                              <TruckIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-900">
                        #{po.orderNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(po.status)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {po.product?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {po.product?.sku}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-900">
                          Supplier: {po.supplier?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Quantity: {po.quantity} {po.product?.unit}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Amount:</span>
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(po.totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Order Date:</span>
                        <span>{formatDate(po.orderDate)}</span>
                      </div>

                      {(po.status === 'pending' || po.status === 'approved') && (
                        <div className="flex justify-end gap-2 mt-3">
                          {po.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(po.id, 'approved')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Approve"
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(po.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Cancel"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {po.status === 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(po.id, 'delivered')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Mark as Delivered"
                            >
                              <TruckIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                showingFrom={(pagination.page - 1) * pagination.limit + 1}
                showingTo={Math.min(pagination.page * pagination.limit, pagination.total)}
                totalItems={pagination.total}
                itemType="purchase orders"
              />
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPO ? 'Edit Purchase Order' : 'Create New Purchase Order'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Product Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Product</option>
                    {productOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Supplier</option>
                    {supplierOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Expected Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Additional notes or instructions..."
                />
              </div>

              {/* Total Amount Display */}
              {formData.quantity && formData.unitPrice && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.unitPrice))}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : (editingPO ? 'Update' : 'Create Purchase Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
