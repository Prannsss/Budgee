# 💰 Budgee Backend - Your Finance Buddy

A robust, scalable backend API for Budgee, a comprehensive finance tracking SaaS application. Built with Node.js, TypeScript, Express, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [License](#license)

## ✨ Features

- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 👤 **User Management** - Registration, login, profile management
- 💳 **Account Management** - Connect multiple bank accounts and e-wallets
- 💸 **Transaction Tracking** - Income and expense management with categories
- 📊 **Dashboard Analytics** - Real-time financial summaries and insights
- 🎯 **Subscription Plans** - Free, Basic, and Premium tiers with different limits
- 🔔 **Activity Logging** - Comprehensive audit trail
- 🌐 **OAuth Support** - Google and Facebook login (optional)
- 📧 **OTP Verification** - Secure account and phone verification
- 🛡️ **Security** - Helmet, CORS, rate limiting, input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database and app configuration
│   │   ├── database.ts
│   │   └── sequelize.ts
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── plan.controller.ts
│   │   ├── account.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── category.controller.ts
│   │   └── dashboard.controller.ts
│   ├── models/           # Sequelize models
│   │   ├── index.ts
│   │   ├── Plan.ts
│   │   ├── User.ts
│   │   ├── Account.ts
│   │   ├── Transaction.ts
│   │   ├── Category.ts
│   │   ├── OTP.ts
│   │   └── ActivityLog.ts
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── plan.routes.ts
│   │   ├── account.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── category.routes.ts
│   │   └── dashboard.routes.ts
│   ├── middlewares/      # Custom middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/            # Utility functions
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── app.ts            # Express app setup
│   └── index.ts          # Server entry point
├── database/
│   └── schema.sql        # PostgreSQL database schema
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Prannsss/Budgee.git
cd Budgee/backend
```

### 2. Install dependencies

```bash
npm install
```

## ⚙️ Configuration

### 1. Create environment file

Copy the example environment file and update with your configuration:

```bash
cp .env.example .env
```

### 2. Update .env file

Edit `.env` with your database credentials and JWT secrets:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgee_dev
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**⚠️ Important**: Generate strong, random secrets for production:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🗄️ Database Setup

### 1. Create PostgreSQL database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE budgee_dev;

# Exit psql
\q
```

### 2. Run database schema

```bash
# Run the SQL schema file
psql -U postgres -d budgee_dev -f database/schema.sql
```

This will:
- Create all required tables (users, plans, accounts, transactions, categories, otps, activity_logs)
- Set up foreign key relationships
- Add indexes for performance
- Insert seed data for subscription plans (Free, Basic, Premium)
- Create database triggers for timestamp updates

### 3. Verify database setup

```bash
# Check tables
psql -U postgres -d budgee_dev -c "\dt"

# Check plans data
psql -U postgres -d budgee_dev -c "SELECT * FROM plans;"
```

## 🚀 Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Build for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Run production build
npm start
```

### Run Type Checking

```bash
npm run typecheck
```

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Authentication Endpoints

#### POST `/api/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "SecurePass123",
  "phone": "09171234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object with plan details */ },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

#### GET `/api/auth/me`

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Dela Cruz",
      "email": "juan@example.com",
      "plan": { /* plan details */ }
    }
  }
}
```

---

### 💳 Plans Endpoints

#### GET `/api/plans`

Get all available subscription plans.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "Free",
        "price": 0.00,
        "max_wallets": 1,
        "max_accounts": 1,
        "ai_enabled": false,
        "ads_enabled": true
      },
      {
        "id": 2,
        "name": "Basic",
        "price": 299.00,
        "max_wallets": 3,
        "max_accounts": 3,
        "ai_enabled": false,
        "ads_enabled": false
      },
      {
        "id": 3,
        "name": "Premium",
        "price": 499.00,
        "max_wallets": 5,
        "max_accounts": 8,
        "ai_enabled": true,
        "ads_enabled": false
      }
    ]
  }
}
```

---

#### POST `/api/plans/upgrade`

Upgrade user's subscription plan (requires authentication).

**Request Body:**
```json
{
  "plan_id": 2
}
```

---

### 🏦 Accounts Endpoints

#### GET `/api/accounts`

Get all connected accounts (requires authentication).

---

#### POST `/api/accounts`

Connect a new bank account or e-wallet (requires authentication).

**Request Body:**
```json
{
  "name": "GCash",
  "type": "e-wallet",
  "account_number": "09171234567",
  "logo_url": "https://example.com/gcash-logo.png",
  "balance": 5000.00
}
```

---

#### DELETE `/api/accounts/:id`

Disconnect an account (requires authentication).

---

### 💸 Transactions Endpoints

#### GET `/api/transactions`

Get all transactions with filters (requires authentication).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Filter by 'income' or 'expense'
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)
- `account_id` - Filter by account
- `category_id` - Filter by category

---

#### POST `/api/transactions`

Create a new transaction (requires authentication).

**Request Body:**
```json
{
  "account_id": 1,
  "category_id": 5,
  "type": "expense",
  "amount": 250.50,
  "date": "2024-10-13",
  "note": "Lunch at restaurant"
}
```

---

#### PUT `/api/transactions/:id`

Update a transaction (requires authentication).

---

#### DELETE `/api/transactions/:id`

Delete a transaction (requires authentication).

---

### 📂 Categories Endpoints

#### GET `/api/categories`

Get all categories (requires authentication).

**Query Parameters:**
- `type` - Filter by 'income' or 'expense'

---

#### POST `/api/categories`

Create a custom category (requires authentication).

**Request Body:**
```json
{
  "name": "Freelance",
  "type": "income",
  "icon": "💼",
  "color": "#4CAF50"
}
```

---

### 📊 Dashboard Endpoints

#### GET `/api/dashboard`

Get financial dashboard summary (requires authentication).

**Query Parameters:**
- `period` - 'week', 'month', or 'year' (default: 'month')

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 50000.00,
      "totalExpense": 35000.00,
      "netBalance": 15000.00,
      "totalBalance": 25000.00,
      "transactionCount": 125,
      "accountCount": 3
    },
    "categoryBreakdown": {
      "expenses": { /* expenses by category */ },
      "income": { /* income by source */ }
    },
    "recentTransactions": [ /* last 10 transactions */ ],
    "monthlyTrend": [ /* 6 months trend */ ]
  }
}
```

---

## 🌐 Frontend Integration

### Using Axios (Recommended)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example: Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.data.token);
  return response.data;
};

// Example: Get transactions
const getTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};
```

### Using Fetch

```typescript
const API_URL = 'http://localhost:5000/api';

const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  return data;
};
```

---

## 🚢 Deployment

### Deploy to Railway

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

3. **Login and deploy**
```bash
railway login
railway init
railway add
railway up
```

4. **Add PostgreSQL database**
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

5. **Set environment variables**
   - Go to your project settings
   - Add all variables from `.env.example`
   - Make sure `NODE_ENV=production`

6. **Run database migration**
```bash
railway run psql $DATABASE_URL -f database/schema.sql
```

### Deploy to Render

1. **Create Render account** at [render.com](https://render.com)

2. **Create PostgreSQL database**
   - Dashboard → New → PostgreSQL
   - Copy the Internal Database URL

3. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select branch: `budgee-backend`

4. **Configure Build & Start commands**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Set environment variables**
   - Add `DATABASE_URL` (from PostgreSQL database)
   - Add all other variables from `.env.example`

6. **Deploy** - Render will automatically deploy on push

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `budgee_dev` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `DATABASE_URL` | Full database URL (production) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | Random 64-character string |
| `JWT_REFRESH_SECRET` | Refresh token secret | Random 64-character string |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CORS_ORIGIN` | Allowed origin | `http://localhost:3000` |

---

## 🐛 Troubleshooting

### Database Connection Error

**Error**: `Unable to connect to the database`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
1. Change port in `.env`: `PORT=5001`
2. Or kill process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

### TypeScript Errors

**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prannsss**
- GitHub: [@Prannsss](https://github.com/Prannsss)

---

## 🙏 Acknowledgments

- Built with ❤️ for the Budgee Finance App
- Thanks to all contributors and the open-source community

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@budgee.com (if applicable)

---

**Happy Coding! 💰✨**
