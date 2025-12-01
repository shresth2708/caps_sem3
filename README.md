# 📘 **Product Requirements Document (PRD)**

# **StockPilot – Smart Inventory Management System**

![StockPilot](https://img.shields.io/badge/StockPilot-v1.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)

---

# 1. **Overview**

## 1.1 **Product Summary**

StockPilot is a modern, cloud-based inventory management system for small and medium-sized businesses. It simplifies product tracking, stock monitoring, supplier management, and analytics visualization through an intuitive dashboard.

The system ensures real-time stock visibility, reduces manual errors, and helps businesses optimize purchasing and warehouse operations.

## 1.2 **Primary Users**

* **Admin** - Full system access with management capabilities
* **User (Inventory Staff)** - Operational access for day-to-day inventory tasks

---

# 2. **Goal & Objectives**

## 2.1 **Primary Goals**

* Prevent stockouts & overstocking
* Centralize all inventory & supplier data
* Provide accurate real-time analytics
* Improve warehouse operational efficiency

## 2.2 **Key Objectives**

* Reduce manual tracking
* Provide web-accessible inventory details
* Improve supplier coordination
* Deliver actionable insights

---

# 3. **User Roles & Permissions**

## 3.1 **Admin**

* Manage users (create/delete)
* Manage roles (assign user/admin)
* Full CRUD on products
* Full CRUD on suppliers
* Access to dashboard analytics
* Adjust stock thresholds
* View system logs (optional future feature)

## 3.2 **User (Inventory Staff)**

* View products
* Update stock quantity (add/remove goods)
* View suppliers
* View dashboard
* Cannot delete products, suppliers, or users

---

# 4. **Core Features**

## 4.1 **Authentication & Authorization**

### Features:
* JWT-based login/signup
* Role-based access control (Admin/User)
* Session expiration and refresh
* Password hashing with bcrypt

### User Flows:
* Login → Dashboard
* Admin can create a new user
* Logout clears session tokens

## 4.2 **Product Management**

### Admin Features:
* Create new product
* Update product details
* Delete product
* Assign product to supplier
* Set low-stock threshold

### User Features:
* View all products
* Update product quantity (stock in/out)
* Mark damaged/expired stock

### Product Fields:
* `id`, `name`, `category`, `price`, `quantity`, `supplierId`, `createdAt`

## 4.3 **Stock Monitoring**

### Features:
* Auto-detection of low-stock items
* Tag low-stock products with red badge
* Stock movement history (optional future feature)
* Real-time total inventory value calculation

### Alerts:
* Products with quantity below threshold
* Products nearing expiry (optional future feature)

## 4.4 **Supplier Management**

### Admin Features:
* Add supplier
* Edit supplier details
* Delete supplier
* View products supplied

### User Features:
* View supplier list
* View supplier contact + product mapping

### Supplier Fields:
* `id`, `name`, `contact`, `products[]`

## 4.5 **Dashboard & Analytics**

### KPIs:
* Total number of products
* Total suppliers
* Total inventory value
* Low-stock product count
* Category-wise stock distribution chart
* Top suppliers by volume

### Charts:
* Bar/Pie chart for categories
* Line chart for stock movement (optional)

## 4.6 **User Management (Admin Only)**

### Features:
* Create new user
* Assign role (admin/user)
* Reset password
* Deactivate accounts

### Fields:
* `id`, `name`, `email`, `role`, `createdAt`

---

# 5. **Non-Functional Requirements**

## 5.1 **Performance**
* API response time < 200ms
* Dashboard load time < 1.5s

## 5.2 **Security**
* bcrypt password hashing
* JWT token expiry
* Role-based middleware
* Validation for input fields

## 5.3 **Scalability**
* Horizontally scalable (React + Node + PostgreSQL)
* Prisma ORM ensures easy schema migration

## 5.4 **Reliability**
* Proper error handling
* Consistent database transactions

---

# 6. **Tech Stack**

| Layer    | Technologies                                         |
| -------- | ---------------------------------------------------- |
| Frontend | React.js, TailwindCSS, React Router, Axios           |
| Backend  | Node.js, Express.js                                  |
| Database | PostgreSQL + Prisma ORM                              |
| Auth     | JWT                                                  |
| Hosting  | Vercel (Frontend), Render (Backend), Neon/Aiven (DB) |

## 6.1 **Architecture**

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

## 6.2 **Frontend Technologies**
- **React 18** - UI library
- **Vite** - Build tool  
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 6.3 **Backend Technologies**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Joi** - Validation

---

# 7. **API Endpoints**

## **Authentication**
* POST `/api/auth/signup`
* POST `/api/auth/login`

## **Products**
* GET `/api/products` → All users
* POST `/api/products` → Admin
* PUT `/api/products/:id` → Admin  
* PATCH `/api/products/:id/stock` → User & Admin
* DELETE `/api/products/:id` → Admin

## **Suppliers**
* GET `/api/suppliers`
* POST `/api/suppliers` → Admin
* PUT `/api/suppliers/:id` → Admin
* DELETE `/api/suppliers/:id` → Admin

## **Dashboard**
* GET `/api/dashboard/stats`

---

# 8. **Database Schema (Prisma)**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user") // "admin" | "user"
  createdAt DateTime @default(now())
}

model Supplier {
  id       Int       @id @default(autoincrement())
  name     String
  contact  String?
  products Product[]
}

model Product {
  id         Int       @id @default(autoincrement())
  name       String
  category   String
  price      Float
  quantity   Int
  supplierId Int?
  supplier   Supplier? @relation(fields: [supplierId], references: [id])
  createdAt  DateTime  @default(now())
}
```

---

# 9. **UI/UX Requirements**

## 9.1 **Pages**
* Login Page
* Dashboard Page
* Product List Page
* Product Add/Edit Page
* Supplier List Page
* Supplier Add/Edit Page
* User Management (Admin only)
* Profile Page

## 9.2 **UI Style**
* Clean, minimal analytics dashboard
* TailwindCSS reusable components
* Mobile & tablet responsive
* Modern charts using Recharts

---

# 10. **Development Roadmap (1 Month)**

| Week   | Milestone             | Tasks                                          |
| ------ | --------------------- | ---------------------------------------------- |
| Week 1 | Backend Setup         | Auth, Products API, Supplier API, Prisma setup |
| Week 2 | Frontend Setup        | Login, Product pages, Supplier pages           |
| Week 3 | Dashboard & Analytics | Charts, stats API, protected routes            |
| Week 4 | Testing & Deployment  | Bug fixes, optimization, deployment            |

---

# 11. **Future Enhancements (Not for MVP but good for v2.0)**

* Barcode/QR code scanning
* Inventory movement logs
* Purchase order automation
* Notifications via email
* Multi-warehouse support
* Export reports (CSV, PDF)

---

# 12. **Prerequisites & Setup**

## 12.1 **Prerequisites**
- Node.js v16 or higher
- PostgreSQL v13 or higher
- npm or yarn
- Git

## 12.2 **Quick Start**

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

---

# 13. **Project Structure**

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

---

# 14. **Deployment**

## 14.1 **Backend (Render/Railway)**

**Render:**
1. Push code to GitHub
2. Create Web Service on Render
3. Configure build: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## 14.2 **Frontend (Vercel/Netlify)**

**Vercel:**
1. Import GitHub repository
2. Framework: Vite
3. Build command: `npm run build`
4. Output: `dist`
5. Add `VITE_API_URL` environment variable
6. Deploy

## 14.3 **Database (Neon/Aiven)**

**Neon (Recommended):**
1. Create account at neon.tech
2. Create new project
3. Copy connection string
4. Use in `DATABASE_URL`

---

# 15. **Testing & Quality Assurance**

## 15.1 **Manual Testing**
1. Test authentication (login/signup)
2. Test product CRUD operations
3. Test stock quantity updates
4. Test low stock alerts
5. Test role-based permissions

## 15.2 **API Testing**
Use Postman/Thunder Client:
1. Import API collection
2. Set base URL
3. Test endpoints
4. Verify responses

---

# 16. **Troubleshooting**

## 16.1 **Backend Issues**

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

## 16.2 **Frontend Issues**

**Cannot Connect to API:**
- Check backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors

**CORS Error:**
- Update CORS config in backend
- Add frontend URL to allowed origins

---

# 🎯 **Final Summary**

This PRD provides a **professional-grade, startup-quality blueprint** for StockPilot - a comprehensive inventory management system. The system is designed with clean architecture, clear role separation, and scalable technology choices suitable for real-world deployment.

## **Key Differentiators:**
- ✅ Professional PRD structure
- ✅ Clear role-based permissions (Admin/User)
- ✅ Scalable tech stack
- ✅ Production-ready deployment strategy
- ✅ Comprehensive API design
- ✅ Future enhancement roadmap

---

# 17. **Learning Resources**

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs)

---

# 18. **Contributing & Support**

## 18.1 **Contributing**
This is a semester project. For contributions:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 18.2 **Support**
For issues or questions:
1. Check documentation in `backend/README.md` and `frontend/README.md`
2. Review troubleshooting sections
3. Check error logs
4. Create GitHub issue

---

# 19. **License & Credits**

## 19.1 **License**
MIT License - Feel free to use for learning purposes

## 19.2 **Project Info**
**Semester 3 Capstone Project**
- Project: StockPilot
- Course: Full-Stack Development
- Duration: 4 weeks

## 19.3 **Acknowledgments**
- React team for amazing library
- Prisma team for excellent ORM
- Tailwind CSS for utility-first CSS
- All open-source contributors

---

**⭐ If you find this project useful, please give it a star!**

Made with ❤️ for Semester 3 Capstone Project
