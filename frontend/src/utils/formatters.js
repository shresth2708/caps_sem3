// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Format date and time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return formatDate(date);
  }
};

// Get stock status
export const getStockStatus = (quantity, minStockLevel) => {
  if (quantity === 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      color: 'red',
      badgeClass: 'badge-danger',
    };
  } else if (quantity <= minStockLevel) {
    return {
      status: 'low_stock',
      label: 'Low Stock',
      color: 'yellow',
      badgeClass: 'badge-warning',
    };
  } else {
    return {
      status: 'in_stock',
      label: 'In Stock',
      color: 'green',
      badgeClass: 'badge-success',
    };
  }
};

// Get transaction type label
export const getTransactionTypeLabel = (type) => {
  const labels = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    adjustment: 'Adjustment',
    return: 'Return',
    damage: 'Damage/Loss',
  };
  return labels[type] || type;
};

// Get transaction type color
export const getTransactionTypeColor = (type) => {
  const colors = {
    stock_in: 'green',
    stock_out: 'red',
    adjustment: 'blue',
    return: 'yellow',
    damage: 'orange',
  };
  return colors[type] || 'gray';
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getStockStatus,
  getTransactionTypeLabel,
  getTransactionTypeColor,
  truncateText,
  calculatePercentage,
  generateRandomColor,
};
