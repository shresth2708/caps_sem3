import { useState, useEffect } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import transactionService from '../services/transactionService';
import productService from '../services/productService';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Filters and pagination
  const [selectedType, setSelectedType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    productId: '',
    type: '',
    quantity: '',
    unitPrice: '',
    notes: '',
    referenceNo: ''
  });

  const limit = 20;

  // Transaction type options
  const transactionTypes = [
    { value: 'stock_in', label: 'Stock In' },
    { value: 'stock_out', label: 'Stock Out' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'return', label: 'Return' },
    { value: 'damage', label: 'Damage' }
  ];

  // Load initial data
  useEffect(() => {
    loadProducts();
  }, []);

  // Load transactions when filters change
  useEffect(() => {
    loadTransactions();
  }, [selectedType, selectedProduct, startDate, endDate, currentPage]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        type: selectedType,
        productId: selectedProduct,
        startDate,
        endDate
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      const response = await transactionService.getAll(params);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
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

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleProductFilter = (productId) => {
    setSelectedProduct(productId);
    setCurrentPage(1);
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    loadTransactions();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      productId: '',
      type: '',
      quantity: '',
      unitPrice: '',
      notes: '',
      referenceNo: ''
    });
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      
      const submitData = {
        ...transactionForm,
        productId: parseInt(transactionForm.productId),
        quantity: parseInt(transactionForm.quantity),
        unitPrice: transactionForm.unitPrice ? parseFloat(transactionForm.unitPrice) : null
      };

      const response = await transactionService.create(submitData);
      if (response.success) {
        toast.success('Transaction recorded successfully!');
        setShowTransactionModal(false);
        resetTransactionForm();
        loadTransactions();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'stock_in':
      case 'return':
        return <ArrowUpIcon className={`${iconClass} text-green-600`} />;
      case 'stock_out':
      case 'damage':
        return <ArrowDownIcon className={`${iconClass} text-red-600`} />;
      case 'adjustment':
        return <AdjustmentsHorizontalIcon className={`${iconClass} text-blue-600`} />;
      default:
        return <AdjustmentsHorizontalIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getTransactionBadge = (type) => {
    const badgeConfig = {
      stock_in: { color: 'bg-green-100 text-green-800', label: 'Stock In' },
      stock_out: { color: 'bg-red-100 text-red-800', label: 'Stock Out' },
      adjustment: { color: 'bg-blue-100 text-blue-800', label: 'Adjustment' },
      return: { color: 'bg-green-100 text-green-800', label: 'Return' },
      damage: { color: 'bg-red-100 text-red-800', label: 'Damage' }
    };

    const config = badgeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadTransactions}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button 
          onClick={() => setShowTransactionModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterDropdown
            label="Type"
            options={transactionTypes}
            selectedValue={selectedType}
            onSelect={handleTypeFilter}
            placeholder="All Types"
          />
          <FilterDropdown
            label="Product"
            options={productOptions}
            selectedValue={selectedProduct}
            onSelect={handleProductFilter}
            placeholder="All Products"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        {(startDate || endDate) && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Apply Date Filter
            </button>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Clear Dates
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <AdjustmentsHorizontalIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
            <p className="mt-1 text-sm text-gray-500">
              No transactions match your current filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-2">
                            {getTransactionBadge(transaction.type)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.product?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {transaction.product?.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.quantity} {transaction.product?.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.beforeQty} → {transaction.afterQty}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.totalValue ? formatCurrency(transaction.totalValue) : '-'}
                        </div>
                        {transaction.unitPrice && (
                          <div className="text-sm text-gray-500">
                            @ {formatCurrency(transaction.unitPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.user?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.createdAt)}
                        </div>
                        {transaction.referenceNo && (
                          <div className="text-sm text-gray-500">
                            Ref: {transaction.referenceNo}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <div className="ml-2">
                          {getTransactionBadge(transaction.type)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {transaction.product?.sku}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-1 text-gray-900">
                            {transaction.quantity} {transaction.product?.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="ml-1 text-gray-900">
                            {transaction.beforeQty} → {transaction.afterQty}
                          </span>
                        </div>
                      </div>

                      {transaction.totalValue && (
                        <div className="text-sm">
                          <span className="text-gray-500">Value:</span>
                          <span className="ml-1 text-gray-900">
                            {formatCurrency(transaction.totalValue)}
                          </span>
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        By: {transaction.user?.name}
                        {transaction.referenceNo && (
                          <span className="ml-2">Ref: {transaction.referenceNo}</span>
                        )}
                      </div>
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
                itemType="transactions"
              />
            )}
          </>
        )}
      </div>

      {/* New Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                New Transaction
              </h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-6 space-y-4">
              {/* Product and Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    name="productId"
                    value={transactionForm.productId}
                    onChange={handleTransactionInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type *
                  </label>
                  <select
                    name="type"
                    value={transactionForm.type}
                    onChange={handleTransactionInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Type</option>
                    {transactionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity and Unit Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={transactionForm.quantity}
                    onChange={handleTransactionInputChange}
                    required
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter quantity"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    {transactionForm.type === 'adjustment' 
                      ? 'Set the final quantity (not the change amount)'
                      : 'Enter the quantity for this transaction'
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (optional)
                  </label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={transactionForm.unitPrice}
                    onChange={handleTransactionInputChange}
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                  <div className="mt-1 text-sm text-gray-500">
                    Leave empty to use product's default price
                  </div>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  value={transactionForm.referenceNo}
                  onChange={handleTransactionInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Invoice #, PO #, etc."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={transactionForm.notes}
                  onChange={handleTransactionInputChange}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Additional notes or reasons for this transaction..."
                />
              </div>

              {/* Transaction Type Help */}
              {transactionForm.type && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>{transactionTypes.find(t => t.value === transactionForm.type)?.label}:</strong>
                    <div className="mt-1">
                      {transactionForm.type === 'stock_in' && 'Increases inventory (e.g., purchases, returns from customers)'}
                      {transactionForm.type === 'stock_out' && 'Decreases inventory (e.g., sales, transfers)'}
                      {transactionForm.type === 'adjustment' && 'Sets inventory to exact quantity (e.g., after physical count)'}
                      {transactionForm.type === 'return' && 'Increases inventory (items returned to supplier)'}
                      {transactionForm.type === 'damage' && 'Decreases inventory (damaged/expired items)'}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
