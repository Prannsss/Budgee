-- ================================================
-- Budgee Database Schema (PostgreSQL)
-- Finance Tracking SaaS Application
-- ================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- ================================================
-- Table: plans
-- Description: Subscription plans available in Budgee
-- ================================================
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    max_wallets INTEGER NOT NULL DEFAULT 1,
    max_accounts INTEGER NOT NULL DEFAULT 1,
    ai_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ads_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Table: users
-- Description: User accounts and authentication
-- ================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    plan_id INTEGER NOT NULL DEFAULT 1,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    oauth_provider VARCHAR(50), -- 'google', 'facebook', or NULL
    oauth_id VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================================
-- Table: accounts
-- Description: Connected bank accounts and e-wallets
-- ================================================
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "GCash", "BDO Savings"
    type VARCHAR(20) NOT NULL CHECK (type IN ('bank', 'e-wallet')),
    account_number VARCHAR(100), -- Masked or encrypted
    balance DECIMAL(15, 2) DEFAULT 0.00,
    verified BOOLEAN DEFAULT FALSE,
    logo_url VARCHAR(500), -- Logo of bank/e-wallet
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: categories
-- Description: Income and expense categories (user-specific)
-- ================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50), -- Icon name or emoji
    color VARCHAR(7), -- Hex color code
    is_default BOOLEAN DEFAULT FALSE, -- System default categories
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(user_id, name, type)
);

-- ================================================
-- Table: transactions
-- Description: Financial transactions (income/expense)
-- ================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    receipt_url VARCHAR(500), -- Optional receipt image
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ================================================
-- Table: otps
-- Description: One-time passwords for verification
-- ================================================
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'email_verify', 'phone_verify', 'account_verify', 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: activity_logs
-- Description: User activity tracking and audit trail
-- ================================================
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'login', 'transaction_created', 'plan_upgraded'
    description TEXT,
    ip_address VARCHAR(45), -- Support IPv4 and IPv6
    user_agent TEXT,
    metadata JSONB, -- Additional data in JSON format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Indexes for Performance Optimization
-- ================================================

-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Account queries
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);

-- Transaction queries (most frequently accessed)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);

-- Category lookups
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- OTP verification
CREATE INDEX idx_otps_user_id ON otps(user_id);
CREATE INDEX idx_otps_code ON otps(code);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);

-- Activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ================================================
-- Seed Data: Subscription Plans
-- ================================================

INSERT INTO plans (name, price, max_wallets, max_accounts, ai_enabled, ads_enabled, description) VALUES
('Free', 0.00, 1, 1, FALSE, TRUE, 'Get started with basic finance tracking. 1 wallet, 1 bank account, with ads.'),
('Basic', 299.00, 3, 3, FALSE, FALSE, 'Perfect for individuals. 3 wallets, 3 bank accounts, no ads.'),
('Premium', 499.00, 5, 8, TRUE, FALSE, 'Full experience with AI insights. 5 wallets, 8 bank accounts, AI-powered summaries, no ads.');

-- ================================================
-- Seed Data: Default Categories
-- Note: These will be copied to new users on signup
-- ================================================

-- We'll create a system user (id: 0) for default categories
-- In the application, these will be cloned for each new user

-- Income Categories (Examples)
-- Salary, Freelance, Business, Investment, Gift, Other

-- Expense Categories (Examples)
-- Food & Dining, Transportation, Shopping, Bills & Utilities
-- Entertainment, Healthcare, Education, Travel, Personal Care, Other

-- ================================================
-- Functions and Triggers
-- ================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Views for Common Queries
-- ================================================

-- User Dashboard Summary View
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    p.name as plan_name,
    COUNT(DISTINCT a.id) as total_accounts,
    COUNT(DISTINCT CASE WHEN a.type = 'e-wallet' THEN a.id END) as total_wallets,
    COUNT(DISTINCT CASE WHEN a.type = 'bank' THEN a.id END) as total_banks,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as net_balance
FROM users u
LEFT JOIN plans p ON u.plan_id = p.id
LEFT JOIN accounts a ON u.id = a.user_id AND a.is_active = TRUE
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.name, u.email, p.name;

-- ================================================
-- Grant Permissions (if needed for specific user)
-- ================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budgee_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO budgee_user;

-- ================================================
-- End of Schema
-- ================================================

-- Verification Queries (Run these to verify setup)
-- SELECT * FROM plans;
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM information_schema.table_constraints WHERE table_schema = 'public';
