import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import SearchInput from '../components/ui/SearchInput';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    parentId: ''
  });
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const limit = 20;

  // Load categories when filters change
  useEffect(() => {
    loadCategories();
  }, [searchQuery, currentPage, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery,
        sortBy,
        sortOrder
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      const response = await categoryService.getAll(params);
      setCategories(response.data.categories);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
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
      description: '',
      color: '#3B82F6',
      parentId: ''
    });
    setEditingCategory(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name || '',
      description: category.description || '',
      color: category.color || '#3B82F6',
      parentId: category.parentId || ''
    });
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null
      };

      let response;
      if (editingCategory) {
        response = await categoryService.update(editingCategory.id, submitData);
      } else {
        response = await categoryService.create(submitData);
      }

      if (response.success) {
        toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        resetForm();
        loadCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await categoryService.delete(categoryId);
      if (response.success) {
        toast.success('Category deleted successfully!');
        loadCategories();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete category');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadCategories}
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
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        {user?.role === 'admin' && (
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Category
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Search categories by name or description..."
          className="w-full max-w-md"
        />
      </div>

      {/* Categories Grid */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
            <div className="mt-6">
              <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                New Category
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 h-6 w-6 rounded-full"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          ></div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.parent?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category._count?.products || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category.children?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user?.role === 'admin' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Category"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(category.id, category.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Category"
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

            {/* Mobile Card View */}
            <div className="sm:hidden">
              <div className="space-y-4 p-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div 
                          className="flex-shrink-0 h-6 w-6 rounded-full mr-3"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        ></div>
                        <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {category.description || 'No description'}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Products: {category._count?.products || 0}</span>
                      <span>Subcategories: {category.children?.length || 0}</span>
                    </div>
                    {category.parent && (
                      <div className="text-sm text-gray-500 mt-1">
                        Parent: {category.parent.name}
                      </div>
                    )}
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
                itemType="categories"
              />
            )}
          </>
        )}
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Parent (Root Category)</option>
                    {categories
                      .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
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
                    {submitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
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

export default Categories;
