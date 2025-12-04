# Render deployment configuration
# 1. Skip database connection test during build phase
SKIP_DB_CONNECTION_TEST=true

# 2. Use this build command in Render dashboard:
#    npm install && export SKIP_DB_CONNECTION_TEST=true && npx prisma generate

# 3. Use this start command:
#    node server.js

# 4. Environment Variables to set in Render:
#    NODE_ENV=production
#    SKIP_DB_CONNECTION_TEST=true
#    DATABASE_URL=your_neon_pooled_connection_string
#    DIRECT_DATABASE_URL=your_neon_direct_connection_string
#    JWT_SECRET=your_jwt_secret
#    JWT_EXPIRES_IN=7d

# Alternative deployment approach:
# If database connections still timeout, you can:
# 1. Deploy without running Prisma migrations during build
# 2. Run migrations manually after deployment using Render's shell
# 3. Use the direct connection URL for migrations