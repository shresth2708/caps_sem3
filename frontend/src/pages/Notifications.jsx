import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon, 
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';
import SearchInput from '../components/ui/SearchInput';
import FilterDropdown from '../components/ui/FilterDropdown';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const limit = 10;

  // Load notifications when filters change
  useEffect(() => {
    loadNotifications();
  }, [searchQuery, selectedType, showUnreadOnly, currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search: searchQuery,
        type: selectedType,
        unreadOnly: showUnreadOnly
      };

      // Remove empty params
      Object.keys(params).forEach(key => 
        (params[key] === '' || params[key] === false) && delete params[key]
      );

      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleUnreadFilter = (unreadOnly) => {
    setShowUnreadOnly(unreadOnly);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      setMarkingAllRead(true);
      await notificationService.markAllAsRead();
      loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.delete(notificationId);
      loadNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconConfig = {
      low_stock: { icon: ExclamationTriangleIcon, color: 'text-yellow-500' },
      out_of_stock: { icon: ExclamationTriangleIcon, color: 'text-red-500' },
      reorder_point: { icon: ClockIcon, color: 'text-orange-500' },
      expiry_warning: { icon: ExclamationTriangleIcon, color: 'text-amber-500' },
      new_order: { icon: InformationCircleIcon, color: 'text-blue-500' },
      order_delivered: { icon: CheckCircleIcon, color: 'text-green-500' },
      system: { icon: InformationCircleIcon, color: 'text-gray-500' }
    };

    const config = iconConfig[type] || iconConfig.system;
    const IconComponent = config.icon;

    return <IconComponent className={`h-6 w-6 ${config.color}`} />;
  };

  const getNotificationBadgeColor = (type) => {
    const colorConfig = {
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      reorder_point: 'bg-orange-100 text-orange-800',
      expiry_warning: 'bg-amber-100 text-amber-800',
      new_order: 'bg-blue-100 text-blue-800',
      order_delivered: 'bg-green-100 text-green-800',
      system: 'bg-gray-100 text-gray-800'
    };

    return colorConfig[type] || colorConfig.system;
  };

  const getTypeLabel = (type) => {
    const types = notificationService.getNotificationTypes();
    const typeObj = types.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
        <button 
          onClick={loadNotifications}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const typeOptions = notificationService.getNotificationTypes().map(type => ({
    value: type.value,
    label: type.label
  }));

  const filterOptions = [
    { value: false, label: 'All Notifications' },
    { value: true, label: 'Unread Only' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BellIcon className="h-8 w-8 text-gray-900" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={async () => {
                try {
                  await notificationService.generateSamples();
                  toast.success('Sample notifications generated!');
                  loadNotifications();
                } catch (error) {
                  toast.error('Failed to generate samples');
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm"
            >
              Generate Samples
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              disabled={markingAllRead}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              {markingAllRead ? 'Marking...' : 'Mark All Read'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search notifications by title or message..."
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <FilterDropdown
              label="Type"
              options={typeOptions}
              selectedValue={selectedType}
              onSelect={handleTypeFilter}
              placeholder="All Types"
              icon={FunnelIcon}
            />
            <FilterDropdown
              label="Status"
              options={filterOptions}
              selectedValue={showUnreadOnly}
              onSelect={handleUnreadFilter}
              placeholder="All Status"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {showUnreadOnly ? 'No unread notifications found.' : 'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop List View */}
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationBadgeColor(notification.type)}`}>
                            {getTypeLabel(notification.type)}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.product && (
                          <p className="text-xs text-gray-500 mt-1">
                            Related to: {notification.product.name} (SKU: {notification.product.sku})
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                showingFrom={(pagination.page - 1) * pagination.limit + 1}
                showingTo={Math.min(pagination.page * pagination.limit, pagination.total)}
                totalItems={pagination.total}
                itemType="notifications"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
