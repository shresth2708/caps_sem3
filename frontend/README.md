# StockPilot Frontend

React-based frontend for StockPilot Inventory Management System

## 🌐 **Live Application**

**Production URL**: [https://caps-sem3.vercel.app/](https://caps-sem3.vercel.app/)

## 🚀 Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **QR Codes**: html5-qrcode, qrcode.react

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Update the variables:

**Development:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=StockPilot
VITE_ENV=development
```

**Production:**
```env
VITE_API_URL=https://caps-sem3.onrender.com/api
VITE_APP_NAME=StockPilot
VITE_ENV=production
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── layout/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   └── common/
│       └── (reusable components)
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── Suppliers.jsx
│   ├── Transactions.jsx
│   ├── PurchaseOrders.jsx
│   ├── Categories.jsx
│   ├── Notifications.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   └── dashboardService.js
├── utils/
│   ├── constants.js
│   ├── formatters.js
│   └── validators.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎨 Features Implemented

### ✅ Phase 1 (Complete)
- [x] Project setup with Vite
- [x] Tailwind CSS configuration
- [x] React Router setup
- [x] Authentication context
- [x] Login page
- [x] Signup page
- [x] Protected routes
- [x] Layout with Navbar and Sidebar
- [x] Dashboard with stats
- [x] API integration with Axios
- [x] Token management
- [x] Error handling

### 🚧 Phase 2 (To Implement)
- [ ] Product listing with pagination
- [ ] Product add/edit forms
- [ ] Product search and filters
- [ ] QR code generation
- [ ] Supplier management
- [ ] Transaction recording
- [ ] Purchase order creation
- [ ] Category management
- [ ] Notifications system
- [ ] Analytics charts
- [ ] Export to PDF/Excel

## 🔐 Authentication

The app uses JWT-based authentication:

1. User logs in with email and password
2. Backend returns JWT token and refresh token
3. Token is stored in localStorage
4. Token is sent with every API request
5. Auto-refresh on token expiry
6. Auto-logout on auth failure

### Protected Routes

All routes except `/login` and `/signup` require authentication.

Admin-only features:
- Creating/editing/deleting products
- Managing suppliers
- Approving purchase orders

## 📡 API Integration

API calls are made using Axios with:
- Automatic token injection
- Token refresh on 401 errors
- Global error handling
- Request/response interceptors

Example:
```javascript
import productService from '../services/productService';

const products = await productService.getAll({
  page: 1,
  limit: 20,
  search: 'laptop'
});
```

## 🎨 Styling

Using Tailwind CSS with custom components:

### Custom Classes
```css
.btn - Base button
.btn-primary - Primary button
.btn-secondary - Secondary button
.card - Card container
.input - Form input
.badge - Status badge
```

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

## 🧩 Components

### Layout Components
- **Layout** - Main layout wrapper
- **Navbar** - Top navigation bar
- **Sidebar** - Side navigation menu

### Auth Components
- **ProtectedRoute** - Route guard for authentication

### Common Components (To Add)
- Button
- Input
- Select
- Modal
- Table
- Pagination
- Loading
- Alert

## 📊 State Management

Using React Context API for:
- **AuthContext** - User authentication state
- Future: NotificationContext, ThemeContext

## 🔧 Utility Functions

### Formatters (`utils/formatters.js`)
- `formatCurrency()` - Format numbers as currency
- `formatDate()` - Format dates
- `formatRelativeTime()` - "2 hours ago" format
- `getStockStatus()` - Get stock status badge

### Validators (`utils/validators.js`)
- `validateEmail()`
- `validatePassword()`
- `validateRequired()`
- `validatePositiveNumber()`

### Constants (`utils/constants.js`)
- App configuration
- API endpoints
- User roles
- Status options

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
5. Deploy

### Deploy to Netlify

1. Connect GitHub repository
2. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add environment variables
4. Deploy

## 🧪 Development Tips

### Run with Backend
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Common Tasks

**Add a new page:**
1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Sidebar.jsx`

**Add a new API service:**
1. Create service in `src/services/`
2. Use axios instance from `api.js`
3. Handle errors with try-catch

**Add a new component:**
1. Create component in `src/components/`
2. Use Tailwind classes for styling
3. Make it reusable with props

## 📝 Code Style

- Use functional components with hooks
- Use arrow functions
- Use destructuring
- Keep components small and focused
- Add prop types for reusable components
- Use meaningful variable names

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
- Check backend is running on port 5000
- Verify VITE_API_URL in .env
- Check CORS configuration in backend

### Issue: "Token expired"
- Token auto-refreshes
- If refresh fails, user is logged out
- Login again to get new tokens

### Issue: "Page not found after refresh"
- Configure server for SPA routing
- For Netlify, add `_redirects` file
- For Vercel, add `vercel.json`

## 📚 Next Steps

1. Implement Product Management UI
2. Add Charts with Recharts
3. Implement QR Code features
4. Add Transaction forms
5. Build Purchase Order workflow
6. Add Notifications
7. Implement Reports
8. Add Mobile responsiveness
9. Optimize performance
10. Add unit tests

## 🎯 Performance Optimization

- Code splitting with React.lazy()
- Memoization with useMemo/useCallback
- Debouncing search inputs
- Pagination for large lists
- Image optimization
- Bundle size analysis

## 📱 Responsive Design

All pages are responsive:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security

- Sanitize user inputs
- XSS protection (React escapes by default)
- CSRF protection via tokens
- Secure token storage
- HTTPS only in production

## 📄 License

MIT

---

For backend documentation, see `../backend/README.md`
