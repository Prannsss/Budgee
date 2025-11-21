# Budgee - Complete Application Documentation

**Version:** 1.0.1  
**Author:** Prannsss  
**Last Updated:** October 15, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [UI/UX Design](#uiux-design)
6. [Features & Functionality](#features--functionality)
7. [Architecture & Design Patterns](#architecture--design-patterns)
8. [Security & Performance](#security--performance)
9. [PWA Features](#pwa-features)
10. [Deployment & Configuration](#deployment--configuration)
11. [Competitor Analysis](#competitor-analysis)

---

## Overview

**Budgee** is a modern, full-stack Progressive Web Application (PWA) designed to help users manage their personal finances with ease. It provides comprehensive tools for tracking income, expenses, savings, and financial accounts, with AI-powered insights for premium users.

### Key Highlights
- 💰 Multi-account financial tracking (Bank, E-Wallet, Cash)
- 📊 Real-time dashboard with financial analytics
- 🤖 AI-powered financial insights (Premium feature)
- 🎯 Savings allocation tracking
- 📱 Progressive Web App with offline support
- 🔐 Secure authentication with JWT and OAuth
- 💳 Tiered subscription model (Free, Budgeet, Premium)

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15.5.4 (React 18.3.1)
- **Language:** TypeScript 5.x
- **Styling:** 
  - Tailwind CSS 3.4.1
  - CSS Variables for theming
  - tailwindcss-animate for animations
- **UI Components:** 
  - Radix UI (Accessible component primitives)
  - shadcn/ui design system
  - Lucide React (Icons)
- **State Management:** 
  - React Context API (Auth, Subscription, Pin)
  - React Hooks
- **Charts & Visualization:** Recharts 2.15.1
- **Forms:** React Hook Form 7.54.2 + Zod validation
- **Animations:** Framer Motion 12.23.19
- **AI Integration:** 
  - Genkit 1.14.1
  - Google AI (Gemini 2.5 Flash)
- **PWA:**
  - Service Workers
  - Web App Manifest
  - Offline support with caching
- **PDF/Export:** jsPDF, html2canvas
- **Fonts:** Montserrat (primary), Roboto (secondary)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18.2
- **Language:** TypeScript 5.3.3
- **Database:** PostgreSQL (Supabase)
- **ORM:** Sequelize 6.37.7
- **Database Client:** @supabase/supabase-js (for Supabase integration)
- **Authentication:** 
  - JWT (jsonwebtoken 9.0.2)
  - Passport.js (Google & Facebook OAuth)
- **Security:**
  - Helmet 7.1.0
  - bcrypt 6.0.0
  - CORS 2.8.5
  - express-rate-limit 7.1.5
- **Validation:** express-validator 7.0.1
- **Email:** Brevo API (API-based email service)
- **Utilities:** 
  - dayjs (date manipulation)
  - uuid (unique identifiers)
  - compression (response compression)
  - morgan (logging)

### Development Tools
- **Package Manager:** npm 9.0.0+
- **Process Manager:** nodemon (backend dev)
- **Build Tool:** Webpack (via Next.js), Turbopack (dev mode)
- **Linting:** ESLint
- **Testing:** Jest (configured)
- **API Testing:** Postman collections included

### External Services
- **Backend Hosting:** Render (https://render.com)
- **Frontend Hosting:** Vercel (https://vercel.com)
- **Database:** Supabase (PostgreSQL hosting)
- **AI Service:** Google Gemini AI (via Genkit)
- **OAuth Providers:** Google OAuth 2.0, Facebook Login
- **Email Service:** Brevo API (https://brevo.com)
- **Firebase:** Optional (for additional features)

---

## Database Design

### Database Management System
**PostgreSQL (Supabase)** - Managed PostgreSQL database with JSONB support for flexible metadata storage, real-time capabilities, and built-in authentication features

### Schema Overview

The database consists of **13 main tables** with comprehensive relationships and constraints:

#### 1. **plans**
Subscription plan definitions
```sql
Fields:
- id (PK, SERIAL)
- name (VARCHAR, UNIQUE) - 'Free', 'Budgeet', 'Premium'
- price (DECIMAL)
- max_wallets (INTEGER)
- max_accounts (INTEGER)
- ai_enabled (BOOLEAN)
- ads_enabled (BOOLEAN)
- description (TEXT)
- features (TEXT[]) - Array of feature strings
- created_at, updated_at (TIMESTAMP)
```

#### 2. **users**
User accounts and profiles
```sql
Fields:
- id (PK, SERIAL)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- phone (VARCHAR)
- password_hash (VARCHAR)
- plan_id (FK → plans.id)
- avatar_url (VARCHAR)
- email_verified (BOOLEAN)
- phone_verified (BOOLEAN)
- is_active (BOOLEAN)
- oauth_provider (VARCHAR) - 'google', 'facebook', or NULL
- oauth_id (VARCHAR)
- last_login (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)

Relationships:
- belongs to plan
- has many accounts, transactions, categories
```

#### 3. **institutions**
Financial institution reference data (banks, e-wallets)
```sql
Fields:
- id (PK, SERIAL)
- name (VARCHAR) - e.g., "BDO", "GCash", "Maya"
- type (VARCHAR) - 'bank', 'e-wallet', 'credit', 'others'
- country (VARCHAR) - Default: 'Philippines'
- logo_url (TEXT)
- is_supported (BOOLEAN)
- created_at (TIMESTAMP)
```

#### 4. **accounts**
User financial accounts (Cash, Bank, E-Wallet)
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- institution_id (FK → institutions.id, nullable)
- name (VARCHAR) - User-friendly name
- type (VARCHAR) - 'Cash', 'Bank', 'E-Wallet'
- account_number (VARCHAR) - Masked/encrypted
- balance (DECIMAL) - Auto-updated via triggers
- verified (BOOLEAN)
- logo_url (VARCHAR)
- is_manual (BOOLEAN) - TRUE for user-declared, FALSE for API-connected
- is_active (BOOLEAN)
- metadata (JSONB) - Additional account data
- created_at, updated_at (TIMESTAMP)

Key Features:
- Automatic balance updates via database triggers
- Support for both manual and API-connected accounts
```

#### 5. **categories**
Income/Expense categorization
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- name (VARCHAR)
- type (VARCHAR) - 'income' or 'expense'
- is_default (BOOLEAN) - System default categories
- parent_id (FK → categories.id, nullable) - For subcategories
- created_at, updated_at (TIMESTAMP)

Unique Constraint: (user_id, name, type)

Examples:
- Income: Salary, Freelance, Business, Investment
- Expense: Food & Dining, Transportation, Shopping, Bills
```

#### 6. **transactions**
Financial transactions
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- account_id (FK → accounts.id)
- category_id (FK → categories.id)
- type (VARCHAR) - 'income', 'expense', 'transfer'
- amount (DECIMAL, CHECK > 0)
- description (TEXT)
- date (DATE)
- notes (TEXT)
- receipt_url (VARCHAR) - Optional receipt image
- status (VARCHAR) - 'pending', 'completed', 'failed'
- recurring_frequency (VARCHAR) - 'daily', 'weekly', 'monthly', 'yearly'
- recurring_parent_id (FK → transactions.id)
- metadata (JSONB)
- created_at, updated_at (TIMESTAMP)

Triggers:
- Auto-updates account.balance on INSERT/UPDATE/DELETE
```

#### 7. **transaction_transfers**
Links transfer transactions between accounts
```sql
Fields:
- id (PK, SERIAL)
- from_transaction_id (FK → transactions.id)
- to_transaction_id (FK → transactions.id)
- transfer_fee (DECIMAL)
- created_at (TIMESTAMP)

Unique: (from_transaction_id, to_transaction_id)
```

#### 8. **savings_allocations**
Savings deposits and withdrawals
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- account_id (FK → accounts.id)
- amount (DECIMAL)
- type (VARCHAR) - 'deposit' or 'withdrawal'
- description (TEXT)
- date (DATE)
- created_at, updated_at (TIMESTAMP)
```

#### 9. **user_pins**
6-digit app security PINs
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id, UNIQUE)
- pin_hash (VARCHAR) - bcrypt hashed
- is_enabled (BOOLEAN)
- failed_attempts (INTEGER)
- locked_until (TIMESTAMP) - Account lockout
- last_used (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 11. **refresh_tokens**
JWT refresh token management
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- token (VARCHAR, UNIQUE)
- expires_at (TIMESTAMP)
- is_revoked (BOOLEAN)
- device_info (TEXT)
- ip_address (VARCHAR) - IPv4/IPv6
- created_at (TIMESTAMP)
```

#### 12. **otps**
One-time password verification
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- code (VARCHAR, 6 digits)
- purpose (VARCHAR) - 'email_verify', 'phone_verify', 'password_reset'
- expires_at (TIMESTAMP)
- is_verified (BOOLEAN)
- attempts (INTEGER)
- max_attempts (INTEGER) - Default: 3
- created_at (TIMESTAMP)
```

#### 13. **activity_logs**
Audit trail and user activity tracking
```sql
Fields:
- id (PK, SERIAL)
- user_id (FK → users.id)
- action (VARCHAR) - 'login', 'transaction_created', 'plan_upgraded'
- entity_type (VARCHAR) - 'transaction', 'account', 'goal'
- entity_id (INTEGER)
- description (TEXT)
- ip_address (VARCHAR)
- user_agent (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)
```

### Database Indexes

**50+ strategically placed indexes** for optimal query performance:

```sql
-- User lookups
idx_users_email, idx_users_plan_id, idx_users_oauth, idx_users_active

-- Transaction queries (most critical)
idx_transactions_user_id, idx_transactions_account_id
idx_transactions_category_id, idx_transactions_date
idx_transactions_user_date, idx_transactions_recurring

-- Account queries
idx_accounts_user_id, idx_accounts_institution_id
idx_accounts_type, idx_accounts_active

-- Category, savings, OTP, activity logs indexes
... (See schema.sql for complete list)
```

### Database Triggers & Functions

#### Auto-update Triggers
1. **update_updated_at_column()** - Automatically updates `updated_at` timestamp
2. **update_account_balance()** - Syncs account balances when transactions change

### Seed Data

#### Default Subscription Plans
```javascript
Free Plan:
- Price: ₱0/month
- 1 bank + 1 e-wallet
- Ads enabled, no AI
- Basic features

Budgeet Plan:
- Price: ₱199/month
- 5 accounts
- AI insights enabled
- Export features

Premium Plan:
- Price: ₱499/month
- 15 accounts
- Full AI assistant
- Advanced analytics
```

### Entity Relationship Diagram (ERD) Summary

```
users (1) ←→ (N) accounts
users (1) ←→ (N) transactions
users (1) ←→ (N) categories
users (1) ←→ (N) savings_allocations
users (1) ←→ (1) user_pins
users (N) ←→ (1) plans

accounts (1) ←→ (N) transactions
accounts (1) ←→ (N) savings_allocations
accounts (N) ←→ (1) institutions

transactions (N) ←→ (1) categories
transactions (1) ←→ (1) transaction_transfers (for transfers)
```

---

## API Design

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://app-name.onrender.com/api`

### Authentication
- **Type:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Token Expiry:** 15m (configurable)
- **Refresh Token:** Supported via `/api/auth/refresh`

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### API Endpoints

#### 1. Authentication & User Management (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/verify-email` | Verify email with OTP | No |
| POST | `/resend-verification` | Resend verification email | No |
| GET | `/me` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/change-password` | Change password | Yes |
| POST | `/logout` | User logout | Yes |
| GET | `/google` | Initiate Google OAuth | No |
| GET | `/google/callback` | Google OAuth callback (Render-hosted) | No |
| GET | `/facebook` | Initiate Facebook OAuth | No |
| GET | `/facebook/callback` | Facebook OAuth callback (Render-hosted) | No |

**Example Request - Signup:**
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+639123456789"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "plan_id": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful. Please verify your email."
}
```

#### 2. Accounts Management (`/api/accounts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user accounts | Yes |
| GET | `/:id` | Get single account | Yes |
| POST | `/` | Create new account | Yes |
| PUT | `/:id` | Update account | Yes |
| POST | `/:id/verify` | Verify account | Yes |
| DELETE | `/:id` | Delete account | Yes |

**Example Request - Create Account:**
```json
POST /api/accounts
{
  "name": "BDO Savings",
  "type": "Bank",
  "institution_id": 5,
  "account_number": "****1234",
  "balance": 25000.00,
  "is_manual": true
}
```

#### 3. Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all transactions (with filters) | Yes |
| GET | `/:id` | Get single transaction | Yes |
| POST | `/` | Create transaction | Yes |
| PUT | `/:id` | Update transaction | Yes |
| DELETE | `/:id` | Delete transaction | Yes |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date
- `type` - Filter by type (income/expense/transfer)
- `account_id` - Filter by account
- `category_id` - Filter by category

**Example Request - Create Transaction:**
```json
POST /api/transactions
{
  "account_id": 1,
  "category_id": 5,
  "type": "expense",
  "amount": 450.50,
  "description": "Grocery shopping at SM",
  "date": "2025-10-15",
  "notes": "Weekly grocery run",
  "status": "completed"
}
```

#### 4. Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | Yes |
| GET | `/:id` | Get single category | Yes |
| POST | `/` | Create category | Yes |
| PUT | `/:id` | Update category | Yes |
| DELETE | `/:id` | Delete category | Yes |

**Example Request - Create Category:**
```json
POST /api/categories
{
  "name": "Online Shopping",
  "type": "expense",
  "parent_id": null
}
```

#### 5. Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get dashboard summary | Yes |
| GET | `/spending-by-category` | Get spending breakdown | Yes |
| GET | `/income-by-source` | Get income breakdown | Yes |

**Example Response - Dashboard Summary:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 45000.00,
    "totalExpenses": 28500.00,
    "savings": 5000.00,
    "netWorth": 21500.00,
    "accounts": [
      {
        "id": 1,
        "name": "BDO Savings",
        "balance": 15000.00
      }
    ],
    "recentTransactions": [ ... ]
  }
}
```

#### 6. Savings (`/api/savings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/allocations` | Get all savings allocations | Yes |
| GET | `/allocations/:id` | Get single allocation | Yes |
| POST | `/allocations` | Create savings allocation | Yes |
| DELETE | `/allocations/:id` | Delete allocation | Yes |
| GET | `/total` | Get total savings | Yes |

**Example Request - Create Savings Allocation:**
```json
POST /api/savings/allocations
{
  "account_id": 1,
  "amount": 2000.00,
  "type": "deposit",
  "description": "Monthly savings for vacation",
  "date": "2025-10-15"
}
```

#### 7. Subscription Plans (`/api/plans`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all available plans | No |
| GET | `/:id` | Get single plan details | No |

#### 8. PIN Management (`/api/pin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/setup` | Set up user PIN | Yes |
| POST | `/verify` | Verify PIN | Yes |
| PUT | `/change` | Change PIN | Yes |
| POST | `/reset` | Reset PIN (with OTP) | Yes |

### Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 100 (production), 1000 (development)
- **Response:** 429 Too Many Requests

### Validation
All endpoints use **express-validator** for input validation with detailed error messages.

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## UI/UX Design

### Design System

#### Color Palette

**Light Mode:**
```css
--background: 240 5% 96%     /* Light gray background */
--foreground: 240 5% 15%     /* Dark gray text */
--primary: 250 60% 55%       /* Purple/blue primary */
--secondary: 240 5% 90%      /* Light gray secondary */
--accent: 240 5% 85%         /* Subtle accent */
--destructive: 0 84.2% 60.2% /* Red for errors */
--border: 240 5% 85%         /* Border color */
```

**Dark Mode:**
```css
--background: 240 5% 10%     /* Dark background */
--foreground: 240 5% 90%     /* Light text */
--primary: 250 60% 60%       /* Bright purple/blue */
--secondary: 240 5% 20%      /* Dark gray secondary */
--accent: 240 5% 25%         /* Dark accent */
```

**Chart Colors:**
- Chart 1: `hsl(250 70% 60%)` - Primary chart color
- Chart 2: `hsl(250 60% 70%)` - Secondary
- Chart 3-5: Progressive lighter shades

#### Typography

**Font Families:**
- **Primary:** Montserrat (400, 500, 600, 700, 800)
- **Secondary:** Roboto (400, 500, 700)
- **Code:** ui-monospace, SFMono-Regular, Menlo

**Font Sizes & Hierarchy:**
```
- Headings: 2xl to 4xl (responsive)
- Body: base (16px default)
- Small: sm (14px)
- Tiny: xs (12px)
```

#### Spacing System
Tailwind's default spacing scale (0.25rem increments):
- `p-2` = 0.5rem (8px)
- `p-4` = 1rem (16px)
- `p-6` = 1.5rem (24px)
- `gap-6` for card/component spacing

#### Border Radius
```css
--radius: 0.5rem        /* Base radius */
lg: var(--radius)       /* 0.5rem */
md: calc(--radius - 2px) /* 0.375rem */
sm: calc(--radius - 4px) /* 0.25rem */
```

#### Icons
**Lucide React** - Consistent 24x24 icon system
- Sidebar: 20x20
- Buttons: 16x16 - 20x20
- Large actions: 24x24

### Component Library

**shadcn/ui + Radix UI Components:**
1. **Layout Components**
   - Card (with header, content, footer variants)
   - Sidebar (collapsible, responsive)
   - Tabs
   - Separator
   - Scroll Area

2. **Form Components**
   - Input (with validation states)
   - Select (dropdown)
   - Checkbox
   - Radio Group
   - Switch
   - Slider
   - Calendar/Date Picker
   - Textarea

3. **Feedback Components**
   - Toast (notifications)
   - Alert Dialog
   - Alert (info, warning, error, success)
   - Progress Bar
   - Loading Skeleton
   - Badge

4. **Navigation Components**
   - Dropdown Menu
   - Menubar
   - Popover
   - Tooltip
   - Drawer (mobile)

5. **Data Display**
   - Table (with TanStack Table)
   - Avatar
   - Accordion
   - Carousel

6. **Custom Components**
   - StatCard (dashboard metrics)
   - OverviewChart (Recharts integration)
   - RecentTransactions
   - SavingsHistory
   - AddTransactionDialog
   - PaymentModal

### Page Layouts

#### 1. Landing/Login Page
- Clean, centered layout
- Gradient background
- Animated logo/splash screen
- Social login buttons
- Form with validation

#### 2. Dashboard Layout
**Desktop:**
```
+------------------+------------------------+
|   Sidebar (240px)|   Main Content         |
|   - Logo         |   - Header             |
|   - Navigation   |   - Cards (3 col grid) |
|   - User Menu    |   - Charts             |
|                  |   - Recent Transactions|
+------------------+------------------------+
```

**Mobile:**
```
+------------------------+
|   Header + User Menu   |
+------------------------+
|   Main Content         |
|   (Single column)      |
|   - Cards (stacked)    |
|   - Charts             |
|   - Transactions       |
+------------------------+
|   Bottom Navigation    |
+------------------------+
```

#### 3. Transaction List
- Filterable table/list
- Date range picker
- Category/account filters
- Export button
- Add transaction FAB (mobile)

#### 4. Accounts Page
- Grid of account cards
- Balance display (toggleable)
- Add account CTA
- Account details modal

#### 5. Settings/Profile
- Tabbed interface
- Profile settings
- Security (PIN, password)
- Subscription management
- Theme selector

### User Flow Diagrams

#### Registration Flow
```
1. Landing Page
   ↓
2. Sign Up Form (name, email, password)
   ↓
3. Email Verification (OTP sent)
   ↓
4. Enter OTP Code
   ↓
5. PIN Setup (6-digit security PIN)
   ↓
6. Dashboard (Free plan)
```

#### Transaction Creation Flow
```
1. Dashboard / Transactions Page
   ↓
2. Click "Add Transaction" button
   ↓
3. Select Transaction Type (Income/Expense/Transfer)
   ↓
4. Fill Form:
   - Amount
   - Account
   - Category
   - Description
   - Date
   - Notes (optional)
   - Receipt (optional)
   ↓
5. Submit
   ↓
6. Confirmation Toast
   ↓
7. Updated Dashboard/List
```

#### Plan Upgrade Flow
```
1. Settings Page → Pricing Tab
   ↓
2. View Plan Comparison
   ↓
3. Click "Upgrade to [Plan]"
   ↓
4. Payment Modal Opens
   ↓
5. Fill Payment Details:
   - Card info
   - Billing address
   - Email for receipt
   ↓
6. Submit Payment
   ↓
7. Processing (2s simulation)
   ↓
8. Success → Plan Updated
   ↓
9. AI Features Unlocked (if applicable)
```

### Responsive Breakpoints
```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1400px /* Large desktops */
```

### Animations & Transitions

1. **Fade-in Elements**
   - Opacity transition: 0.7s ease-out
   - Transform: translateY (16px → 0)
   - Staggered delays on lists

2. **Accordion**
   - Height animation: 0.2s ease-out
   - Smooth open/close

3. **Splash Screen**
   - Diagonal wipe reveal (Framer Motion)
   - Logo scale + fade

4. **Page Transitions**
   - Subtle fade between routes
   - Loading skeletons

### Accessibility Features
- ✅ Keyboard navigation
- ✅ ARIA labels on interactive elements
- ✅ Focus states (ring outline)
- ✅ High contrast mode support
- ✅ Screen reader compatible
- ✅ Semantic HTML
- ✅ Color-blind friendly palette

### Dark Mode Support
- System preference detection
- Manual toggle in settings
- Persistent preference (localStorage)
- Smooth theme transition

---

## Features & Functionality

### Core Features

#### 1. Multi-Account Management
- **Support for 3 account types:** Cash, Bank, E-Wallet
- **Institution database:** Pre-loaded Philippine banks and e-wallets
- **Manual account creation:** User-declared accounts
- **Balance tracking:** Real-time balance updates
- **Account verification:** Optional verification process
- **Plan limits:** Free (1 bank + 1 wallet), Budgeet (5), Premium (15)

#### 2. Transaction Tracking
- **Transaction types:** Income, Expense, Transfer
- **Categorization:** User-defined + default categories
- **Subcategories:** Hierarchical category structure
- **Recurring transactions:** Daily, weekly, monthly, yearly
- **Receipt attachments:** Upload and link receipts
- **Transaction status:** Pending, completed, failed
- **Filters:** Date range, category, account, type
- **Pagination:** Optimized list view

#### 3. Dashboard Analytics
- **Net Worth Display:** Total assets - liabilities
- **Income vs Expenses:** Monthly/yearly comparison
- **Spending by Category:** Pie/bar chart breakdown
- **Account Overview:** All accounts with balances
- **Recent Transactions:** Last 10 transactions
- **Savings Progress:** Visual progress bars
- **Chart Visualizations:** Recharts integration

#### 4. Savings Management
- **Savings Goals:** Named targets with deadlines
- **Goal Tracking:** Visual progress (current/target)
- **Allocations:** Deposit/withdrawal tracking
- **Goal Categories:** Icons and color coding
- **Multiple Goals:** Unlimited savings goals
- **History View:** All savings allocations

#### 5. AI-Powered Insights (Premium Feature)
- **Financial Assistant:** Chat-based AI interface
- **Google Gemini 2.5 Flash:** Advanced language model
- **Genkit Integration:** Streamlined AI workflow
- **Capabilities:**
  - Spending analysis and patterns
  - Budget recommendations
  - Savings advice
  - Transaction summaries
  - Financial Q&A
- **Plan Gating:** Only available for Budgeet & Premium users

#### 6. Subscription Tiers

**Free Plan (₱0/month):**
- 1 bank account connection
- 1 e-wallet connection
- Basic transaction categorization
- Net worth tracking
- Monthly spending summary
- Ads enabled
- No AI features

**Budgeet Plan (₱199/month):**
- Everything in Free
- 5 account connections
- Advanced categorization rules
- AI-powered financial insights
- Export to CSV/Excel
- Budget goals and alerts
- Ad-free experience

**Premium Plan (₱499/month):**
- Everything in Budgeet
- 15 account connections
- Full AI financial assistant
- Investment tracking
- Custom financial reports
- Multi-currency support
- Priority customer support

#### 7. Security Features
- **6-Digit PIN:** App-level security layer
- **PIN Lockout:** After 3 failed attempts
- **JWT Authentication:** Secure token-based auth
- **Refresh Tokens:** Long-lived session management
- **OAuth Support:** Google and Facebook login
- **Password Hashing:** bcrypt with salt
- **Email Verification:** OTP-based verification
- **Activity Logging:** Complete audit trail
- **HTTPS Only:** Secure communication (production)

#### 8. Progressive Web App
- **Installable:** Add to home screen
- **Offline Support:** Service worker caching
- **Push Notifications:** (Planned feature)
- **App-like Experience:** Standalone display mode
- **Cross-platform:** Works on iOS, Android, Desktop
- **Auto-updates:** Seamless version updates
- **Fast Loading:** Optimized bundle size

### Advanced Features

#### 9. Data Export
- **CSV Export:** Transaction history
- **Excel Format:** Formatted spreadsheets
- **PDF Reports:** Visual reports with charts
- **Custom Date Ranges:** Flexible export options
- **Plan Restriction:** Budgeet & Premium only

#### 10. Profile & Settings
- **Profile Management:** Name, email, phone, avatar
- **Password Change:** Secure password updates
- **PIN Management:** Set, change, reset PIN
- **Theme Selection:** Light, dark, system
- **Email Preferences:** Notification settings
- **Plan Management:** View and upgrade subscription

#### 11. OAuth Integration
- **Google OAuth 2.0:** One-click Google sign-in
- **Facebook Login:** Facebook authentication
- **Profile Sync:** Auto-populate user data
- **Seamless Flow:** Redirect-based authentication

#### 12. Email Notifications
- **Service Provider:** Brevo API (formerly Sendinblue)
- **Welcome Email:** After registration
- **OTP Delivery:** Email verification codes
- **Transaction Alerts:** (Planned)
- **Monthly Summary:** (Planned)
- **Plan Renewal:** (Planned)

---

## Architecture & Design Patterns

### Frontend Architecture

#### 1. Next.js App Router
- **File-based Routing:** Automatic route generation
- **Server Components:** Default server rendering
- **Client Components:** `"use client"` directive for interactivity
- **API Routes:** Built-in API endpoints (used for Genkit)
- **Metadata API:** SEO-friendly meta tags

#### 2. State Management
- **React Context API:**
  - `AuthContext` - User authentication state
  - `SubscriptionContext` - Plan and feature flags
  - `PinContext` - PIN verification state
- **Custom Hooks:**
  - `useAuth()` - Access user data
  - `useSubscription()` - Check plan features
  - `useIsMobile()` - Responsive breakpoint detection
  - `useOnlineStatus()` - Network connectivity
  - `useUserData()` - Fetch user data

#### 3. Data Fetching
- **API Service Layer:** Centralized API calls (`lib/api-service.ts`)
- **Promise.all():** Parallel data loading
- **Error Handling:** Try-catch with user feedback
- **Loading States:** Skeleton loaders

#### 4. Component Patterns
- **Composition:** Small, reusable components
- **Container/Presentational:** Logic vs. UI separation
- **Dynamic Imports:** Code-splitting for heavy components
- **Memoization:** `useMemo`, `useCallback` for performance

### Backend Architecture

#### 1. MVC Pattern
```
├── models/         # Sequelize models (data layer)
├── controllers/    # Business logic (application layer)
├── routes/         # API endpoints (presentation layer)
├── middlewares/    # Request/response processing
├── utils/          # Helper functions, validators
└── config/         # Database, passport, env configs
```

#### 2. Middleware Stack
```javascript
1. helmet()              // Security headers
2. cors()                // Cross-origin requests
3. passport.initialize() // OAuth support
4. rateLimit()           // DDoS protection
5. express.json()        // Body parsing
6. compression()         // Response compression
7. morgan()              // Request logging
8. Custom routes
9. notFoundHandler()     // 404 handling
10. errorHandler()       // Global error handling
```

#### 3. Database Layer
- **ORM:** Sequelize for abstraction
- **Connection Pooling:** Optimized database connections
- **Migrations:** Versioned schema changes (planned)
- **Transactions:** ACID compliance for critical operations
- **Triggers:** Auto-update balances and timestamps

#### 4. Security Patterns
- **JWT Strategy:**
  - Access Token: Short-lived (7 days)
  - Refresh Token: Long-lived, revocable
  - Token blacklist on logout
- **Input Validation:** express-validator middleware
- **SQL Injection Prevention:** Parameterized queries (Sequelize)
- **XSS Protection:** Helmet CSP headers
- **CSRF:** (To be implemented for production)

### Design Patterns Used

1. **Repository Pattern:** Data access abstraction (Sequelize models)
2. **Factory Pattern:** Model creation and initialization
3. **Middleware Pattern:** Request/response pipeline
4. **Observer Pattern:** Event-driven updates (e.g., balance updates)
5. **Singleton Pattern:** Database connection, config instances
6. **Strategy Pattern:** Different auth strategies (JWT, OAuth)

---

## Security & Performance

### Security Measures

#### Frontend
1. **Environment Variables:** Sensitive config in `.env.local`
2. **Client-side Validation:** Zod schema validation
3. **XSS Prevention:** React escapes by default
4. **Secure Storage:** JWT in httpOnly cookies (recommended) or localStorage
5. **CSP Headers:** Content Security Policy via Next.js config
6. **HTTPS Only:** Enforce secure connections in production

#### Backend
1. **Helmet.js:** 11+ security headers
2. **CORS Configuration:** Whitelist trusted origins
3. **Rate Limiting:** 100 requests/15 min per IP
4. **bcrypt Hashing:** Password encryption (10 salt rounds)
5. **JWT Secrets:** Strong, environment-based secrets
6. **Input Sanitization:** express-validator
7. **SQL Parameterization:** Sequelize prevents injection
8. **OAuth Token Validation:** Passport.js verification

#### Database
1. **Role-based Access:** PostgreSQL user permissions
2. **Encrypted Connections:** SSL/TLS for database communication
3. **Backup Strategy:** Regular automated backups
4. **Audit Logs:** activity_logs table for tracking

### Performance Optimizations

#### Frontend
1. **Code Splitting:**
   - Dynamic imports for heavy components
   - Route-based splitting (Next.js automatic)
2. **Image Optimization:**
   - Next.js Image component (AVIF, WebP)
   - Lazy loading
   - Responsive images
3. **Bundle Size:**
   - Tree shaking (unused code removal)
   - Package import optimization
   - Webpack Bundle Analyzer for monitoring
4. **Caching:**
   - Service Worker caching (PWA)
   - Static asset caching
   - API response caching (planned)
5. **Performance Monitoring:**
   - Lighthouse scores
   - Core Web Vitals tracking

#### Backend
1. **Database Optimization:**
   - 50+ strategic indexes
   - Query optimization (SELECT specific fields)
   - Connection pooling (Sequelize)
2. **Response Compression:** gzip/brotli via compression middleware
3. **Caching Strategy:**
   - Redis caching (planned)
   - In-memory caching for frequent queries
4. **Load Balancing:** (Production deployment)
5. **Horizontal Scaling:** Stateless design allows multi-instance

#### Database
1. **Indexed Queries:** All foreign keys and frequent WHERE clauses
2. **EXPLAIN ANALYZE:** Query plan optimization
3. **Materialized Views:** (Planned for complex aggregations)
4. **Partitioning:** (For transaction table at scale)

---

## PWA Features

### Manifest Configuration

**File:** `public/manifest.json`

```json
{
  "name": "Budgee - Your Personal Finance Buddy",
  "short_name": "Budgee",
  "description": "The smart, simple way to manage your finances.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "categories": ["finance", "productivity", "business"],
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x720",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "390x844",
      "form_factor": "narrow"
    }
  ]
}
```

### Service Worker

**File:** `public/sw.js`

**Capabilities:**
- Static asset caching
- API response caching (cache-first for static, network-first for dynamic)
- Offline fallback page
- Background sync (planned)
- Push notifications (planned)

### PWA Features Implemented

1. **Install Prompt**
   - Custom install banner
   - Platform-specific install UX
   - Install detection and prompt management

2. **Offline Support**
   - Cached app shell
   - Offline indicator component
   - Graceful degradation

3. **App-like Experience**
   - Standalone display mode
   - No browser UI
   - Splash screen
   - Theme-color meta tags

4. **Cross-Platform**
   - iOS: Add to Home Screen
   - Android: Install prompt
   - Desktop: Chrome/Edge install

5. **Dynamic Status Bar**
   - iOS-specific status bar handling
   - Theme-aware color changes

---

## Deployment & Configuration

### Environment Variables

#### Frontend (`.env.local` - Vercel)
```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://app-name.onrender.com

# Firebase (for AI features)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project

# Google Gemini AI (REQUIRED for AI Chatbot - runs in Next.js Server Actions)
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key

# App
NEXT_PUBLIC_APP_NAME=Budgee
NEXT_PUBLIC_APP_URL=https://budgeebuddy.vercel.app
```

**IMPORTANT:** Set these in Vercel dashboard under Settings > Environment Variables for production deployment.
- The `GOOGLE_GENAI_API_KEY` is **required** for the AI chatbot to work in production
- This must be set in **Vercel** (not Render) because the AI flows run in Next.js Server Actions

#### Backend (`.env` - Render)
```bash
# Server
NODE_ENV=production
PORT=5000

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Connection (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-vercel-app.vercel.app

# OAuth (Render callbacks)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback

FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/facebook/callback

# Brevo Email API
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@budgee.com
BREVO_SENDER_NAME=Budgee Team

# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

**Note:** Set these in Render dashboard under Environment tab for your web service. Supabase credentials are obtained from your Supabase project settings.

### Development Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm 9+

#### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/Prannsss/Budgee.git
   cd Budgee
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Database Setup (Supabase)**
   ```bash
   # Option 1: Create a Supabase project at https://supabase.com
   # - Create new project
   # - Copy project URL and API keys
   # - Run schema via Supabase SQL Editor
   
   # Option 2: Local PostgreSQL for development
   createdb budgee_dev
   psql -U postgres -d budgee_dev -f backend/database/schema.sql
   ```

5. **Configure Environment**
   ```bash
   # Frontend
   cp .env.example .env.local
   # Edit .env.local with:
   # - NEXT_PUBLIC_BACKEND_URL (for local: http://localhost:5000)
   # - Other frontend-specific variables

   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with:
   # - Supabase credentials (SUPABASE_URL, SUPABASE_KEY, DATABASE_URL)
   # - Brevo API key (BREVO_API_KEY)
   # - OAuth credentials and callback URLs
   # - Gemini API key (GEMINI_API_KEY)
   ```

6. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend (start first)
   cd backend
   npm run dev
   # Runs on http://localhost:5000

   # Terminal 2 - Frontend (from root)
   npm run dev
   # Runs on http://localhost:9002
   # Ensure NEXT_PUBLIC_BACKEND_URL points to http://localhost:5000
   ```

### Production Deployment

#### Frontend (Vercel)
```bash
# Vercel automatically builds and deploys from your Git repository

# Manual deployment:
npm run build
vercel --prod

# Environment Variables to set in Vercel:
# - NEXT_PUBLIC_BACKEND_URL (your Render backend URL)
# - GOOGLE_GENAI_API_KEY
# - NEXT_PUBLIC_APP_NAME
# - NEXT_PUBLIC_APP_URL
```

#### Backend (Render)
```bash
# Render automatically builds and deploys from your Git repository

# Build Command: npm install && npm run build (in backend directory)
# Start Command: npm start (in backend directory)

# Environment Variables to set in Render:
# - NODE_ENV=production
# - PORT=5000
# - SUPABASE_URL
# - SUPABASE_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL (Supabase connection string)
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - CORS_ORIGIN (your Vercel frontend URL)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - GOOGLE_CALLBACK_URL (https://your-app.onrender.com/api/auth/google/callback)
# - FACEBOOK_APP_ID
# - FACEBOOK_APP_SECRET
# - FACEBOOK_CALLBACK_URL (https://your-app.onrender.com/api/auth/facebook/callback)
# - BREVO_API_KEY
# - BREVO_SENDER_EMAIL
# - BREVO_SENDER_NAME
# - GEMINI_API_KEY
```

#### Database (Supabase)
1. Create a Supabase project at https://supabase.com
2. Navigate to SQL Editor
3. Run the schema from `backend/database/schema.sql`
4. Copy connection details:
   - Project URL (SUPABASE_URL)
   - Anon/Public key (SUPABASE_KEY)
   - Service role key (SUPABASE_SERVICE_ROLE_KEY)
   - Direct connection string (DATABASE_URL)
5. Add these credentials to Render environment variables

#### OAuth Configuration
**Google OAuth:**
1. Go to Google Cloud Console
2. Add authorized redirect URI: `https://app-name.onrender.com/api/auth/google/callback`
3. Update `GOOGLE_CALLBACK_URL` in Render environment

**Facebook OAuth:**
1. Go to Facebook Developers Console
2. Add OAuth redirect URI: `https://app-name.onrender.com/api/auth/facebook/callback`
3. Update `FACEBOOK_CALLBACK_URL` in Render environment

#### Email Configuration (Brevo)
1. Create account at https://brevo.com
2. Generate API key from Settings > API Keys
3. Add `BREVO_API_KEY` to Render environment
4. Configure sender email and name

#### Current Deployment Stack
- **Frontend:** Vercel (optimized for Next.js)
- **Backend:** Render (Node.js web service)
- **Database:** Supabase (Managed PostgreSQL)
- **Email:** Brevo API
- **AI:** Google Gemini AI
- **Monitoring:** (To be configured: Sentry, LogRocket)

---

## Competitor Analysis

### Direct Competitors (Finance Tracking Apps)

#### 1. **Mint (Intuit)**
**Strengths:**
- Established brand (launched 2006)
- Automatic bank syncing
- Credit score monitoring
- Bill payment reminders
- Large user base in US

**Weaknesses:**
- US-focused (limited international support)
- Ads-heavy free version
- Privacy concerns (data collection)
- Complex UI, not beginner-friendly

**Budgee Advantage:**
- Philippines-focused with local banks/e-wallets
- Clean, modern UI/UX
- Progressive Web App (no app store required)
- Transparent pricing, no hidden ads

#### 2. **YNAB (You Need A Budget)**
**Strengths:**
- Strong budgeting methodology
- Excellent educational content
- Active community
- Bank sync (US/Canada/UK)
- Goal tracking

**Weaknesses:**
- Expensive ($99/year or $14.99/month)
- Steep learning curve
- Limited in emerging markets
- No free tier

**Budgee Advantage:**
- More affordable (₱199-499/month)
- Free tier available
- Simpler onboarding
- AI-powered insights (Premium)
- Local market focus

#### 3. **Wallet by BudgetBakers**
**Strengths:**
- Free version available
- Multi-currency support
- Bank syncing (Europe-focused)
- Mobile apps (iOS, Android)
- Clean interface

**Weaknesses:**
- Limited AI features
- Manual bank sync in most countries
- Premium features behind paywall
- Ads in free version

**Budgee Advantage:**
- AI financial assistant (Gemini 2.5)
- PWA (cross-platform without app stores)
- Better savings goal tracking
- Subscription model more transparent

#### 4. **PocketSmith**
**Strengths:**
- Powerful forecasting (10+ years)
- Calendar view of finances
- Multiple currencies
- Bank feeds (limited countries)

**Weaknesses:**
- Expensive ($12.95-19.95/month)
- Complex for beginners
- Limited mobile experience
- No AI features

**Budgee Advantage:**
- More affordable
- Mobile-first design
- AI insights for trend analysis
- Simpler, more accessible UX

### Local Competitors (Philippines)

#### 5. **GCash / Maya (E-Wallet Built-in Trackers)**
**Strengths:**
- Free to use
- Automatic transaction logging (for in-app transactions)
- Large user base in PH
- Integrated with other services

**Weaknesses:**
- Only tracks their own transactions
- No cross-wallet/bank aggregation
- Limited analytics
- No savings goal features
- No AI

**Budgee Advantage:**
- Multi-account aggregation (all banks/wallets)
- Advanced analytics and insights
- Dedicated savings goal tracking
- AI-powered recommendations
- Holistic financial view

#### 6. **Money Lover**
**Strengths:**
- Popular in Asia
- Free version available
- Expense tracking
- Budget planning
- Debt tracking

**Weaknesses:**
- Manual entry required
- Premium features expensive ($4.99/month)
- Limited AI
- Basic reporting
- Ads in free version

**Budgee Advantage:**
- Modern UI/UX
- Better AI integration (Gemini 2.5)
- PWA technology
- More competitive pricing
- Philippines-specific features

### Market Positioning

**Budgee's Unique Value Propositions:**

1. **Philippines-First Design**
   - Pre-loaded local banks (BDO, BPI, Metrobank, etc.)
   - E-wallet integration (GCash, Maya, ShopeePay)
   - Peso-focused, PH-relevant categories

2. **AI-Powered Insights**
   - Google Gemini 2.5 Flash integration
   - Natural language financial advice
   - Spending pattern analysis
   - Personalized recommendations

3. **Progressive Web App**
   - No app store required
   - Cross-platform (iOS, Android, Desktop)
   - Offline support
   - Instant updates
   - Smaller storage footprint

4. **Transparent Pricing**
   - Free tier (1 bank + 1 wallet)
   - Affordable mid-tier (₱199/month)
   - Clear feature differentiation
   - No hidden fees

5. **Privacy-Focused**
   - Local data storage options
   - No third-party data selling
   - Open-source roadmap (potential)

### Target Market

**Primary:**
- Young professionals (25-35 years old)
- Philippines-based
- Tech-savvy
- Multiple income sources
- Active in digital banking/e-wallets

**Secondary:**
- Small business owners
- Freelancers
- Families managing household budgets
- Students learning financial literacy

### Competitive Advantages Summary

| Feature | Budgee | Mint | YNAB | Wallet | PocketSmith |
|---------|--------|------|------|--------|-------------|
| **Free Tier** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **AI Features** | ✅ (Premium) | ❌ | ❌ | Limited | ❌ |
| **PH Banks** | ✅ | ❌ | ❌ | Limited | ❌ |
| **PWA** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Price** | ₱0-499 | Free (ads) | $99/yr | Free-$5 | $13-20/mo |
| **Offline Mode** | ✅ | ❌ | ❌ | Limited | ❌ |
| **Modern UI** | ✅ | ⚠️ | ✅ | ✅ | ⚠️ |

---

## Conclusion

Budgee is a comprehensive, modern finance tracking application built with cutting-edge technologies and designed specifically for the Philippine market. With its combination of:

- **Robust backend** (Node.js, PostgreSQL, JWT auth)
- **Modern frontend** (Next.js 15, React 18, Tailwind CSS)
- **AI integration** (Google Gemini via Genkit)
- **Progressive Web App** capabilities
- **Tiered subscription model**
- **Security-first approach**

...Budgee is well-positioned to compete in the personal finance management space, offering unique value through local market focus, AI-powered insights, and an accessible, affordable pricing structure.

### Future Roadmap

**Planned Features:**
- 🔄 Automatic bank syncing (via Open Banking APIs)
- 📈 Investment portfolio tracking
- 💱 Multi-currency support
- 🔔 Push notifications for budget alerts
- 📧 Email reports (monthly/weekly summaries)
- 🤝 Shared budgets (family/household)
- 📊 Advanced analytics (custom reports)
- 🌐 Multi-language support (Tagalog, English)

---

**Documentation Generated:** October 15, 2025  
**For support:** support@budgee.com  
**Repository:** https://github.com/Prannsss/Budgee

---

*This documentation is a living document and will be updated as the application evolves.*
