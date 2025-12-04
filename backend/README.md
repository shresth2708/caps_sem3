# StockPilot Backend API

Backend REST API for StockPilot - Intelligent Inventory Management System

## 🌐 **Live API**

**Production URL**: [https://caps-sem3.onrender.com](https://caps-sem3.onrender.com)

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **Validation**: Joi

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database URL (Update with your PostgreSQL credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/stockpilot?schema=public"

# Or use a cloud database (Neon, Aiven, ElephantSQL)
# DATABASE_URL="postgresql://user:pass@hostname:5432/dbname"

# JWT Secret (Generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

### 3. Database Setup

Initialize Prisma and create database tables:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (for development)
npm run prisma:push

# OR create and run migrations (for production)
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://caps-sem3.onrender.com/api
```

### 🔐 Authentication

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/auth/signup` | POST | Register new user | Public |
| `/auth/login` | POST | Login user | Public |
| `/auth/logout` | POST | Logout user | Private |
| `/auth/me` | GET | Get current user | Private |
| `/auth/refresh` | POST | Refresh access token | Public |

**Signup Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin" // or "user"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📦 Products

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/products` | GET | Get all products | Private |
| `/products/:id` | GET | Get single product | Private |
| `/products` | POST | Create product | Admin |
| `/products/:id` | PUT | Update product | Admin |
| `/products/:id` | DELETE | Delete product | Admin |
| `/products/low-stock` | GET | Get low stock items | Private |
| `/products/stats` | GET | Get product statistics | Private |
| `/products/:id/qrcode` | GET | Generate QR code | Private |

**Query Parameters for GET /products:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name, SKU, description
- `category` - Filter by category ID
- `supplier` - Filter by supplier ID
- `status` - Filter by status: `in_stock`, `low_stock`, `out_of_stock`
- `sortBy` - Sort field (default: `createdAt`)
- `sortOrder` - Sort order: `asc` or `desc` (default: `desc`)

**Create Product Request:**
```json
{
  "name": "Laptop Dell XPS 15",
  "sku": "LAP-DELL-001",
  "description": "High-performance laptop",
  "categoryId": 1,
  "supplierId": 2,
  "unitPrice": 1299.99,
  "sellingPrice": 1499.99,
  "quantity": 50,
  "minStockLevel": 10,
  "reorderPoint": 15,
  "reorderQuantity": 30,
  "unit": "pcs"
}
```

### 🏭 Suppliers

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/suppliers` | GET | Get all suppliers | Private |
| `/suppliers/:id` | GET | Get single supplier | Private |
| `/suppliers` | POST | Create supplier | Admin |
| `/suppliers/:id` | PUT | Update supplier | Admin |
| `/suppliers/:id` | DELETE | Delete supplier | Admin |

**Create Supplier Request:**
```json
{
  "name": "Tech Distributors Inc",
  "company": "Tech Dist",
  "email": "sales@techdist.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street, CA",
  "paymentTerms": "Net 30",
  "leadTimeDays": 7
}
```

### 📝 Transactions

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/transactions` | GET | Get all transactions | Private |
| `/transactions` | POST | Create transaction | Private |
| `/transactions/product/:id` | GET | Get product transactions | Private |
| `/transactions/stats` | GET | Get statistics | Private |

**Query Parameters for GET /transactions:**
- `page`, `limit` - Pagination
- `type` - Filter by type: `stock_in`, `stock_out`, `adjustment`, `return`, `damage`
- `productId` - Filter by product
- `startDate`, `endDate` - Date range filter

**Create Transaction Request:**
```json
{
  "productId": 1,
  "type": "stock_in",
  "quantity": 100,
  "unitPrice": 1299.99,
  "notes": "Received from supplier",
  "referenceNo": "PO-2024-001"
}
```

**Transaction Types:**
- `stock_in` - Increase stock (purchase, receipt)
- `stock_out` - Decrease stock (sale, usage)
- `adjustment` - Direct quantity adjustment
- `return` - Customer/supplier return (increases stock)
- `damage` - Damaged/lost items (decreases stock)

### 📊 Dashboard

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/dashboard/stats` | GET | Get overview stats | Private |
| `/dashboard/charts` | GET | Get chart data | Private |
| `/dashboard/recent-activity` | GET | Get recent transactions | Private |

**Dashboard Stats Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 150,
      "totalSuppliers": 25,
      "lowStockCount": 12,
      "outOfStockCount": 3,
      "inventoryValue": 245678.50
    },
    "alerts": {
      "lowStockProducts": [...],
      "outOfStockProducts": [...],
      "reorderProducts": [...]
    }
  }
}
```

### 🛒 Purchase Orders

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/purchase-orders` | GET | Get all POs | Private |
| `/purchase-orders/:id` | GET | Get single PO | Private |
| `/purchase-orders` | POST | Create PO | Admin |
| `/purchase-orders/:id/status` | PUT | Update status | Admin |
| `/purchase-orders/:id` | DELETE | Cancel PO | Admin |

**Create Purchase Order:**
```json
{
  "productId": 1,
  "supplierId": 2,
  "quantity": 100,
  "unitPrice": 1199.99,
  "expectedDate": "2024-11-01",
  "notes": "Urgent order"
}
```

**Update Status:**
```json
{
  "status": "delivered"
}
```

Status options: `pending`, `approved`, `delivered`, `cancelled`

### 🔔 Notifications

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/notifications` | GET | Get user notifications | Private |
| `/notifications/:id/read` | PUT | Mark as read | Private |
| `/notifications/read-all` | PUT | Mark all as read | Private |
| `/notifications/:id` | DELETE | Delete notification | Private |

### 🏷️ Categories

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/categories` | GET | Get all categories | Private |
| `/categories/:id` | GET | Get single category | Private |
| `/categories` | POST | Create category | Admin |
| `/categories/:id` | PUT | Update category | Admin |
| `/categories/:id` | DELETE | Delete category | Admin |

**Create Category:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "color": "#3B82F6",
  "icon": "laptop",
  "parentId": null
}
```

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiry
- Access Token: 1 hour
- Refresh Token: 7 days

Use the `/auth/refresh` endpoint to get a new access token using the refresh token.

## 👥 User Roles

### Admin
- Full access to all features
- Can create, update, delete products, suppliers, categories
- Can manage purchase orders
- Can view all users and analytics

### User
- Can view all data
- Can record transactions (stock in/out)
- Can view notifications
- Cannot delete data or manage users

## 🗄️ Database Schema

### Core Models:
- **User** - User accounts with role-based access
- **Product** - Inventory items with stock tracking
- **Supplier** - Supplier information
- **Category** - Product categorization (hierarchical)
- **Transaction** - Stock movement history
- **PurchaseOrder** - Purchase order management
- **Notification** - User notifications

View complete schema: `prisma/schema.prisma`

## 🧪 Testing with Postman/Thunder Client

1. Import the API collection (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token after login

### Test Flow:
1. **Signup**: POST `/auth/signup`
2. **Login**: POST `/auth/login` → Save token
3. **Create Category**: POST `/categories`
4. **Create Supplier**: POST `/suppliers`
5. **Create Product**: POST `/products`
6. **View Dashboard**: GET `/dashboard/stats`
7. **Record Transaction**: POST `/transactions`

## 📝 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional validation errors
  }
}
```

### Common Error Codes:
- `AUTH_REQUIRED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Invalid input data (400)
- `DUPLICATE_ENTRY` - Resource already exists (409)
- `SERVER_ERROR` - Internal server error (500)

## 🚀 Deployment

### Option 1: Render

1. Push code to GitHub
2. Create account on Render.com
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy

### Option 2: Railway

1. Create account on Railway.app
2. Create new project from GitHub repo
3. Add PostgreSQL database service
4. Configure environment variables
5. Deploy

### Environment Variables for Production:
```env
DATABASE_URL=<production-db-url>
JWT_SECRET=<strong-secret-key>
NODE_ENV=production
PORT=5000
FRONTEND_URL=<production-frontend-url>
```

## 📚 Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema without migrations
npx prisma db push

# Create migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio
```

## 🐛 Troubleshooting

### Issue: "Prisma Client not configured"
```bash
npx prisma generate
```

### Issue: "Can't connect to database"
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify database exists
- Check firewall settings

### Issue: "JWT_SECRET is not defined"
- Make sure `.env` file exists
- Verify JWT_SECRET is set
- Restart server after changes

### Issue: "CORS error"
- Update FRONTEND_URL in `.env`
- Check CORS configuration in `src/app.js`

## 📄 License

MIT

## 👤 Author

Semester 3 Capstone Project - StockPilot

---

## 🎯 Next Steps

1. ✅ Setup database and environment
2. ✅ Test authentication endpoints
3. ✅ Create sample categories and suppliers
4. ✅ Add products and test CRUD operations
5. ✅ Test transaction recording
6. ✅ View dashboard analytics
7. ✅ Test QR code generation
8. ✅ Create purchase orders
9. 🚀 Deploy to production

For frontend setup, see `../frontend/README.md`
