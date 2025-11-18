# 🚀 StockPilot - Quick Setup Guide

Get your inventory management system running in 10 minutes!

## ⚡ Prerequisites Check

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version
npm --version

# Check PostgreSQL (should be running)
psql --version
```

## 📦 Step-by-Step Setup

### Step 1: Database Setup (5 minutes)

**Option A: Local PostgreSQL**
```bash
# Create database
createdb stockpilot

# Or using psql
psql -U postgres
CREATE DATABASE stockpilot;
\q
```

**Option B: Cloud Database (Recommended for beginners)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create new project
4. Copy connection string
5. Skip to Step 2

### Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies (this may take 2-3 minutes)
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your database URL
# For Neon: Use the connection string from Neon
# For local: postgresql://postgres:password@localhost:5432/stockpilot

# Windows users can use:
notepad .env

# Mac/Linux users:
nano .env

# Update these two lines:
DATABASE_URL="your-database-url-here"
JWT_SECRET="your-secret-key-12345678"

# Setup database schema
npx prisma generate
npx prisma db push

# Start backend server
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

### Step 3: Frontend Setup (2 minutes)

Open a NEW terminal window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (usually no changes needed for local development)
# Windows:
notepad .env

# Mac/Linux:
nano .env

# Start frontend server
npm run dev
```

✅ Frontend should now be running on `http://localhost:5173`

### Step 4: Create First User

1. Open browser: `http://localhost:5173`
2. Click "Sign up"
3. Fill in details:
   - Name: Your Name
   - Email: admin@test.com
   - Password: password123
   - Role: Admin
4. Click "Create Account"

🎉 You're all set!

## 🧪 Quick Test

### Test Backend API
```bash
# Open new terminal
curl http://localhost:5000

# Should see: {"success":true,"message":"🎯 StockPilot API..."}
```

### Test Frontend
1. Open browser: `http://localhost:5173`
2. Should see login page
3. Sign up or login
4. Should see dashboard

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@prisma/client'"
```bash
cd backend
npx prisma generate
npm run dev
```

### Issue: "Port 5000 already in use"
```bash
# Kill process on port 5000
# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
# Mac:
brew services start postgresql

# Linux:
sudo service postgresql start

# Windows: Check Services app

# Test connection
psql -U postgres
```

### Issue: "npm install fails"
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Prisma migration failed"
```bash
cd backend
npx prisma db push --force-reset
# Warning: This will reset your database!
```

## 📱 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Prisma Studio** (Database GUI): 
  ```bash
  cd backend
  npx prisma studio
  # Opens at http://localhost:5555
  ```

## 🎯 Next Steps

1. ✅ Explore the dashboard
2. ✅ Add a category (Categories page)
3. ✅ Add a supplier (Suppliers page)
4. ✅ Add products (Products page)
5. ✅ Record a transaction
6. ✅ Check notifications

## 📚 Documentation

- **Main README**: `README.md`
- **Backend Docs**: `backend/README.md`
- **Frontend Docs**: `frontend/README.md`
- **API Endpoints**: `backend/README.md#api-endpoints`

## 💡 Development Tips

### Run Both Servers Together
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### View Database
```bash
cd backend
npx prisma studio
```

### Reset Database (if needed)
```bash
cd backend
npx prisma db push --force-reset
```

### Check Logs
- Backend logs in terminal where you ran `npm run dev`
- Frontend logs in browser console (F12)

## 🎓 Learning Path

1. **Week 1**: Understand backend APIs
   - Test with Postman/Thunder Client
   - Read `backend/README.md`

2. **Week 2**: Build frontend features
   - Start with Product Management
   - Add forms and tables

3. **Week 3**: Add advanced features
   - QR codes
   - Charts
   - Reports

4. **Week 4**: Polish and deploy
   - Testing
   - Bug fixes
   - Deployment

## 🆘 Need Help?

1. Check the main README.md
2. Check backend/README.md for API issues
3. Check frontend/README.md for UI issues
4. Review error messages carefully
5. Google the error (usually someone solved it!)

## ✅ Verification Checklist

- [ ] Node.js installed (v16+)
- [ ] PostgreSQL running
- [ ] Backend dependencies installed
- [ ] Database connected
- [ ] Backend server running (port 5000)
- [ ] Frontend dependencies installed
- [ ] Frontend server running (port 5173)
- [ ] Can access login page
- [ ] Can create account
- [ ] Can see dashboard

If all checked, you're ready to develop! 🚀

## 🎉 Success!

You now have:
- ✅ Full-stack application running
- ✅ Database connected
- ✅ Authentication working
- ✅ Dashboard displaying
- ✅ Ready to add features

**Happy coding!** 💻
