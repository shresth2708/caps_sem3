import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import supplierService from '../services/supplierService';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: '',
    leadTimeDays: '7'
  });
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const limit = 5;

  // Load suppliers when filters change
  useEffect(() => {
    loadSuppliers();
  }, [searchQuery, currentPage]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      const response = await supplierService.getAll(params);
      setSuppliers(response.data.suppliers);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load suppliers');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      paymentTerms: '',
      leadTimeDays: '7'
    });
    setEditingSupplier(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setFormData({
      name: supplier.name || '',
      contact: supplier.contact || '',
      company: supplier.company || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      paymentTerms: supplier.paymentTerms || '',
      leadTimeDays: supplier.leadTimeDays?.toString() || '7'
    });
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        leadTimeDays: parseInt(formData.leadTimeDays)
      };

      let response;
      if (editingSupplier) {
        response = await supplierService.update(editingSupplier.id, submitData);
      } else {
        response = await supplierService.create(submitData);
      }

      if (response.success) {
        toast.success(`Supplier ${editingSupplier ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        loadSuppliers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${editingSupplier ? 'update' : 'create'} supplier`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (supplierId, supplierName) => {
    if (!window.confirm(`Are you sure you want to delete "${supplierName}"?`)) {
      return;
    }

    try {
      const response = await supplierService.delete(supplierId);
      if (response.success) {
        toast.success('Supplier deleted successfully!');
        loadSuppliers();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete supplier');
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">☆</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">★</span>
        );
      }
    }

    return stars;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadSuppliers}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        {user?.role === 'admin' && (
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Search suppliers by name, company, or email..."
          className="w-full max-w-md"
        />
      </div>

      {/* Suppliers Content */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new supplier.</p>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                New Supplier
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.name}
                          </div>
                          {supplier.company && (
                            <div className="text-sm text-gray-500">
                              {supplier.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {supplier.phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier._count?.products || 0} products
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex">
                            {getRatingStars(supplier.rating)}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            ({supplier.rating || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.leadTimeDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {supplier.paymentTerms || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user?.role === 'admin' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(supplier)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Supplier"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(supplier.id, supplier.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Supplier"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              <div className="space-y-4 p-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{supplier.name}</h3>
                        {supplier.company && (
                          <p className="text-sm text-gray-500">{supplier.company}</p>
                        )}
                      </div>
                      {user?.role === 'admin' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(supplier)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Supplier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(supplier.id, supplier.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          {supplier.email}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Products: {supplier._count?.products || 0}</span>
                        <span className="text-gray-500">Lead Time: {supplier.leadTimeDays} days</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <div className="flex">
                            {getRatingStars(supplier.rating)}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">
                            ({supplier.rating || 0})
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {supplier.paymentTerms || 'Terms not specified'}
                        </span>
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
                itemType="suppliers"
              />
            )}
          </>
        )}
      </div>

      {/* Supplier Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingSupplier ? 'Edit Supplier' : 'Create New Supplier'}
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
                  {/* Supplier Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Lead Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      value={formData.leadTimeDays}
                      onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Net 30 days"
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
                    {submitting ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Create Supplier')}
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

export default Suppliers;
