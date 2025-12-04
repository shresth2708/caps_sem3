const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Optimize for serverless/deployment environments
  __internal: {
    engine: {
      // Reduce connection pool size for serverless
      connectionLimit: process.env.NODE_ENV === 'production' ? 5 : 10
    }
  }
});

// Enhanced connection logic for deployment environments
async function connectWithRetry(maxRetries = 3, delay = 1000) {
  // Skip connection test in production to avoid timeouts during build
  if (process.env.NODE_ENV === 'production' && process.env.SKIP_DB_CONNECTION_TEST === 'true') {
    console.log('⏭️  Skipping database connection test in production build');
    return;
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Use a simple query with timeout for connection test
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.log(`❌ Database connection attempt ${i + 1}/${maxRetries} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        if (process.env.NODE_ENV === 'production') {
          console.log('⚠️  Database connection failed in production - this may be normal during build phase');
        } else {
          console.error('❌ All database connection attempts failed. Starting server without database...');
        }
        return;
      }
      
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.2; // Gentle exponential backoff
    }
  }
}

// Test database connection with retry
connectWithRetry();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
});

module.exports = prisma;
