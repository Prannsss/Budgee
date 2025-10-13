# 🚀 Quick Start Guide - Budgee Backend

This guide will help you get the Budgee backend up and running in just a few minutes.

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Minimum required:
# - DB_PASSWORD
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

### Step 3: Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE budgee_dev;"

# Run schema
psql -U postgres -d budgee_dev -f database/schema.sql
```

### Step 4: Start Server

```bash
npm run dev
```

✅ Server should be running at `http://localhost:5000`

## 🧪 Test the API

### 1. Check Health

```bash
curl http://localhost:5000/api/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Save the `token` from the response!

### 4. Get Plans

```bash
curl http://localhost:5000/api/plans
```

### 5. Get Dashboard (Protected Route)

```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Default Subscription Plans

After running the schema, you'll have these plans available:

| Plan | Price | Wallets | Accounts | AI | Ads |
|------|-------|---------|----------|-----|-----|
| Free | ₱0 | 1 | 1 | ❌ | ✅ |
| Basic | ₱299 | 3 | 3 | ❌ | ❌ |
| Premium | ₱499 | 5 | 8 | ✅ | ❌ |

## 🔑 Important First Steps

1. **Change JWT_SECRET** in `.env` to a random string
2. **Set CORS_ORIGIN** to your frontend URL
3. **Update DB credentials** if not using defaults

## 🎯 Next Steps

- Read the full [README.md](README.md) for complete documentation
- Explore API endpoints in the [API Documentation section](README.md#api-documentation)
- Connect your frontend using the examples provided
- Deploy to Railway or Render using the deployment guide

## ⚠️ Common Issues

### "Unable to connect to database"
- Check if PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`

### "Port 5000 already in use"
- Change `PORT=5001` in `.env`

### TypeScript errors
- Run `npm install` again
- Check Node.js version: `node -v` (should be 18+)

## 📞 Need Help?

- Check the main [README.md](README.md)
- Review [Troubleshooting section](README.md#troubleshooting)
- Open an issue on GitHub

Happy coding! 💰✨
