# StockPilot - Intelligent Inventory Management System

A modern, full-stack inventory management system built with React, Node.js, Express, PostgreSQL, and Prisma.

![StockPilot](https://img.shields.io/badge/StockPilot-v1.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)

## 🎯 Project Overview

StockPilot is a comprehensive inventory management solution designed for small to medium-sized businesses. It provides real-time stock tracking, intelligent alerts, supplier management, and actionable analytics to optimize inventory operations.

## ✨ Key Features

### Core Features (MVP)
- ✅ **User Authentication** - JWT-based auth with role-based access control (Admin/User)
- ✅ **Dashboard Analytics** - Real-time inventory overview with charts and stats
- ✅ **Product Management** - Full CRUD with search, filter, pagination
- ✅ **Supplier Management** - Manage supplier information and relationships
- ✅ **Stock Monitoring** - Low stock alerts and inventory valuation
- ✅ **Transaction History** - Complete audit trail of stock movements
- ✅ **Category Management** - Organize products with categories

### Advanced Features
- 🔄 **Smart Reorder System** - Automated reorder point calculations
- 📦 **Purchase Orders** - Complete PO workflow from creation to delivery
- 🔔 **Notifications** - Real-time alerts for low stock and important events
- 📊 **Analytics Charts** - Visual insights with category distribution, trends
- 📱 **QR Code Integration** - Generate and scan QR codes for products
- 📄 **Reports** - Export data as PDF/Excel

## 🏗️ Architecture

```
┌─────────────────┐
│   React.js      │ ← Frontend (Vite + Tailwind CSS)
│   + Tailwind    │
└────────┬────────┘
         │ HTTP/REST API
         ↓
┌─────────────────┐
│   Express.js    │ ← Backend API (JWT Auth)
│   + Node.js     │
└────────┬────────┘
         │ Prisma ORM
         ↓
┌─────────────────┐
│   PostgreSQL    │ ← Database
└─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Joi** - Validation
- **QRCode** - QR generation

## 📋 Prerequisites

- Node.js v16 or higher
- PostgreSQL v13 or higher
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd cap_sem3
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update DATABASE_URL and JWT_SECRET in .env

# Setup database
npx prisma generate
npx prisma db push

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL in .env

# Start frontend server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Access Application

Open browser and navigate to `http://localhost:5173`

**Demo Credentials:**
- Admin: `admin@stockpilot.com` / `password123`
- User: `user@stockpilot.com` / `password123`

## 📁 Project Structure

```
cap_sem3/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## 🗄️ Database Schema

### Core Models
- **User** - Authentication and user management
- **Product** - Inventory items with stock tracking
- **Supplier** - Supplier information
- **Category** - Product categorization
- **Transaction** - Stock movement history
- **PurchaseOrder** - Purchase order management
- **Notification** - User notifications

See `backend/prisma/schema.prisma` for complete schema.

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

#### Dashboard
- `GET /dashboard/stats` - Get overview stats
- `GET /dashboard/charts` - Get chart data

For complete API documentation, see `backend/README.md`

## 👥 User Roles

### Admin
- Full access to all features
- Create, update, delete products/suppliers
- Manage purchase orders
- View all analytics

### User
- View all data
- Record transactions
- View notifications
- Cannot delete data

## 🎨 UI Screenshots

### Dashboard
- Real-time stats cards
- Low stock alerts
- Out of stock warnings
- Quick actions

### Product Management
- Product listing with search/filter
- Add/Edit product forms
- QR code generation
- Stock status indicators

## 🚀 Deployment

### Backend (Render/Railway)

**Render:**
1. Push code to GitHub
2. Create Web Service on Render
3. Configure build: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Frontend (Vercel/Netlify)

**Vercel:**
1. Import GitHub repository
2. Framework: Vite
3. Build command: `npm run build`
4. Output: `dist`
5. Add `VITE_API_URL` environment variable
6. Deploy

### Database (Neon/Aiven)

**Neon (Recommended):**
1. Create account at neon.tech
2. Create new project
3. Copy connection string
4. Use in `DATABASE_URL`

## 🧪 Testing

### Manual Testing
1. Test authentication (login/signup)
2. Test product CRUD operations
3. Test transaction recording
4. Test low stock alerts
5. Test purchase order workflow

### API Testing
Use Postman/Thunder Client:
1. Import API collection
2. Set base URL
3. Test endpoints
4. Verify responses

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection: npx prisma db push
```

**Prisma Client Error:**
```bash
npx prisma generate
```

### Frontend Issues

**Cannot Connect to API:**
- Check backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors

**CORS Error:**
- Update CORS config in backend
- Add frontend URL to allowed origins

## 📝 Development Workflow

### Week 1: Backend Foundation ✅
- [x] Project setup
- [x] Database schema
- [x] Authentication system
- [x] Core CRUD APIs

### Week 2: Frontend Foundation ✅
- [x] React setup
- [x] Authentication UI
- [x] Layout components
- [x] Dashboard

### Week 3: Advanced Features 🚧
- [ ] Product management UI
- [ ] Transaction system
- [ ] Analytics charts
- [ ] QR code integration

### Week 4: Polish & Deploy 📅
- [ ] Testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs)

## 🤝 Contributing

This is a semester project. For contributions:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - Feel free to use for learning purposes

## 👨‍💻 Author

**Semester 3 Capstone Project**
- Project: StockPilot
- Course: Full-Stack Development
- Duration: 4 weeks

## 🎯 Project Goals

- ✅ Demonstrate full-stack development skills
- ✅ Implement RESTful API design
- ✅ Use modern React patterns
- ✅ Apply database design principles
- ✅ Implement authentication & authorization
- ✅ Create responsive UI
- ✅ Deploy to production

## 📞 Support

For issues or questions:
1. Check documentation in `backend/README.md` and `frontend/README.md`
2. Review troubleshooting sections
3. Check error logs
4. Create GitHub issue

## 🙏 Acknowledgments

- React team for amazing library
- Prisma team for excellent ORM
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

**⭐ If you find this project useful, please give it a star!**

Made with ❤️ for Semester 3 Capstone Project
