const prisma = require('../config/database');

// Database connection check middleware
const checkDbConnection = async (req, res, next) => {
  try {
    // Simple query to check database connectivity
    await prisma.$executeRaw`SELECT 1`;
    next();
  } catch (error) {
    console.error('❌ Database connection lost:', error.message);
    
    // Try to reconnect
    try {
      await prisma.$connect();
      console.log('✅ Database reconnected successfully');
      next();
    } catch (reconnectError) {
      console.error('❌ Database reconnection failed:', reconnectError.message);
      
      return res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Database service is temporarily unavailable. Please try again later.'
        }
      });
    }
  }
};

module.exports = { checkDbConnection };