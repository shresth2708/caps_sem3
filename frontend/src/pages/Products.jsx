import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import supplierService from '../services/supplierService';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryId: '',
    description: '',
    price: '',
    quantity: '',
    minStockLevel: '10',
    supplierId: '',
    unit: 'pcs',
    sku: '',
    barcode: ''
  });

  const limit = 20;

  // Status options for filtering
  const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, selectedSupplier, selectedStatus, currentPage, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery,
        category: selectedCategory,
        supplier: selectedSupplier,
        status: selectedStatus,
        sortBy,
        sortOrder
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      const response = await productService.getAll(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll({ limit: 1000 });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSupplierFilter = (supplierId) => {
    setSelectedSupplier(supplierId);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      categoryId: '',
      description: '',
      price: '',
      quantity: '',
      minStockLevel: '10',
      supplierId: '',
      unit: 'pcs',
      sku: '',
      barcode: ''
    });
    setEditingProduct(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name || '',
      category: product.category || '',
      categoryId: product.categoryId || '',
      description: product.description || '',
      price: product.price || product.unitPrice || '',
      quantity: product.quantity || '',
      minStockLevel: product.minStockLevel || '10',
      supplierId: product.supplierId || '',
      unit: product.unit || 'pcs',
      sku: product.sku || '',
      barcode: product.barcode || ''
    });
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        quantity: parseInt(formData.quantity) || 0,
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        categoryId: formData.categoryId && formData.categoryId !== '' ? parseInt(formData.categoryId) : null,
        supplierId: formData.supplierId && formData.supplierId !== '' ? parseInt(formData.supplierId) : null,
        // Ensure category field has a value if categoryId is not set
        category: formData.category || (formData.categoryId ? '' : 'Uncategorized')
      };
      
      console.log('Submitting product data:', submitData);

      let response;
      if (editingProduct) {
        response = await productService.update(editingProduct.id, submitData);
      } else {
        response = await productService.create(submitData);
      }

      if (response.success) {
        toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        loadProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const response = await productService.delete(productId);
      if (response.success) {
        toast.success('Product deleted successfully!');
        loadProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete product');
    }
  };

  const getStockStatusBadge = (stockStatus) => {
    const statusConfig = {
      in_stock: { color: 'bg-green-100 text-green-800', label: 'In Stock' },
      low_stock: { color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' },
      out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    };

    const config = statusConfig[stockStatus] || statusConfig.in_stock;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadProducts}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  const supplierOptions = suppliers.map(sup => ({
    value: sup.id.toString(),
    label: sup.name
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        {/* Debug: Show current user info */}
        <div className="text-xs text-gray-500">
          User: {user?.name} | Role: {user?.role} | Auth: {user ? 'Yes' : 'No'}
        </div>
        {user && (
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search products by name, SKU, or description..."
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <FilterDropdown
              label="Categories"
              options={categoryOptions}
              selectedValue={selectedCategory}
              onSelect={handleCategoryFilter}
              placeholder="All Categories"
              icon={TagIcon}
            />
            <FilterDropdown
              label="Suppliers"
              options={supplierOptions}
              selectedValue={selectedSupplier}
              onSelect={handleSupplierFilter}
              placeholder="All Suppliers"
              icon={BuildingStorefrontIcon}
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              selectedValue={selectedStatus}
              onSelect={handleStatusFilter}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.categoryRef?.name || product.category || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.supplier?.name || 'No Supplier'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.quantity} {product.unit}
                        </div>
                        <div className="text-sm text-gray-500">
                          Min: {product.minStockLevel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(product.price || product.unitPrice)}
                        </div>
                        {product.sellingPrice && (
                          <div className="text-sm text-gray-500">
                            Sell: {formatCurrency(product.sellingPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockStatusBadge(product.stockStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Generate QR Code"
                          >
                            <QrCodeIcon className="h-5 w-5" />
                          </button>
                          {user && (
                            <>
                              <button 
                                onClick={() => openEditModal(product)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Product"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              {user?.role === 'admin' && (
                                <button 
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete Product"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                itemType="products"
              />
            )}
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Electronics, Furniture, etc."
                    />
                  </div>

                  {/* Category Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Reference
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier
                    </label>
                    <select
                      value={formData.supplierId}
                      onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Min Stock Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Stock Level
                    </label>
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="ltr">Liters</option>
                      <option value="box">Boxes</option>
                      <option value="pack">Packs</option>
                    </select>
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
