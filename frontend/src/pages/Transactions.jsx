import { useState, useEffect } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import transactionService from '../services/transactionService';
import productService from '../services/productService';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and pagination
  const [selectedType, setSelectedType] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2">
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
    </div>
  );
};

export default Transactions;
