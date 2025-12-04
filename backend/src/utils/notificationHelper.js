const prisma = require('../config/database');

// Utility function to create notifications
const createNotification = async (notificationData) => {
  try {
    return await prisma.notification.create({
      data: notificationData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create low stock notification
const createLowStockNotification = async (product, userId) => {
  return createNotification({
    userId,
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `Product "${product.name}" is running low. Current stock: ${product.quantity}, Minimum: ${product.minStockLevel}`,
    productId: product.id,
    link: `/products/${product.id}`
  });
};

// Create out of stock notification
const createOutOfStockNotification = async (product, userId) => {
  return createNotification({
    userId,
    type: 'out_of_stock',
    title: 'Out of Stock Alert',
    message: `Product "${product.name}" is out of stock. Immediate restocking required.`,
    productId: product.id,
    link: `/products/${product.id}`
  });
};

// Create reorder point notification
const createReorderPointNotification = async (product, userId) => {
  return createNotification({
    userId,
    type: 'reorder_point',
    title: 'Reorder Point Reached',
    message: `Product "${product.name}" has reached its reorder point. Consider placing a new order.`,
    productId: product.id,
    link: `/products/${product.id}`
  });
};

// Create order delivered notification
const createOrderDeliveredNotification = async (order, userId) => {
  return createNotification({
    userId,
    type: 'order_delivered',
    title: 'Order Delivered',
    message: `Purchase order #${order.orderNumber} has been delivered successfully.`,
    productId: order.productId,
    link: `/purchase-orders/${order.id}`
  });
};

// Create new order notification
const createNewOrderNotification = async (order, userId) => {
  return createNotification({
    userId,
    type: 'new_order',
    title: 'New Purchase Order',
    message: `New purchase order #${order.orderNumber} has been created.`,
    productId: order.productId,
    link: `/purchase-orders/${order.id}`
  });
};

// Create system notification
const createSystemNotification = async (title, message, userId, link = null) => {
  return createNotification({
    userId,
    type: 'system',
    title,
    message,
    link
  });
};

// Generate sample notifications for testing
const generateSampleNotifications = async (userId) => {
  try {
    // Get some products for sample notifications
    const products = await prisma.product.findMany({
      take: 3,
      where: { isActive: true }
    });

    const notifications = [];

    if (products.length > 0) {
      // Low stock notification
      notifications.push(await createLowStockNotification(products[0], userId));
      
      // Out of stock notification (if we have a second product)
      if (products[1]) {
        notifications.push(await createOutOfStockNotification(products[1], userId));
      }
      
      // Reorder point notification (if we have a third product)
      if (products[2]) {
        notifications.push(await createReorderPointNotification(products[2], userId));
      }
    }

    // System notifications
    notifications.push(await createSystemNotification(
      'Welcome to StockPilot',
      'Your inventory management system is ready to use. Start by adding products and suppliers.',
      userId,
      '/dashboard'
    ));

    notifications.push(await createSystemNotification(
      'System Maintenance',
      'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. The system may be unavailable during this time.',
      userId
    ));

    return notifications;
  } catch (error) {
    console.error('Error generating sample notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createLowStockNotification,
  createOutOfStockNotification,
  createReorderPointNotification,
  createOrderDeliveredNotification,
  createNewOrderNotification,
  createSystemNotification,
  generateSampleNotifications
};