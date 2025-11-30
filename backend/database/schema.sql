-- ================================================
-- Budgee Database Schema (PostgreSQL)
-- Finance Tracking SaaS Application
-- Redesigned for scalability and normalization
-- ================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS spending_limits CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_pins CASCADE;
DROP TABLE IF EXISTS savings_allocations CASCADE;
DROP TABLE IF EXISTS transaction_transfers CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
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
    features TEXT[], -- Array of feature strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Table: users
-- Description: User accounts and authentication
-- REMOVED: verification_token, verification_token_expires, last_verification_sent (use otps table instead)
-- ================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL, -- Must use bcrypt or argon2 hashing (recommended: argon2id)
    plan_id INTEGER NOT NULL DEFAULT 1,
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    oauth_provider VARCHAR(50), -- 'google', 'facebook', or NULL
    oauth_id VARCHAR(255), -- Unique per provider - enforced by constraint below
    last_login TIMESTAMP WITH TIME ZONE,
    subscription_upgraded_at TIMESTAMP WITH TIME ZONE, -- Tracks last plan upgrade for 30-day AI buddy access
    subscription_expires_at TIMESTAMP WITH TIME ZONE, -- Tracks when the subscription expires (30 days after upgrade)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT unique_oauth_provider_id UNIQUE (oauth_provider, oauth_id)
);

-- ================================================
-- Table: institutions
-- Description: Reference table for financial institutions (banks, e-wallets, etc.)
-- ================================================
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('bank', 'e-wallet', 'credit', 'others')),
    country VARCHAR(50) DEFAULT 'Philippines',
    logo_url TEXT,
    is_supported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Table: accounts
-- Description: All financial accounts (Cash, Bank, E-Wallet)
-- REMOVED: last_four (can be derived from account_number when needed)
-- ADDED: institution_id (references institutions table)
-- NOTE: is_manual = TRUE means user-declared account with no live API connection
-- ================================================
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    institution_id INTEGER,
    name VARCHAR(100) NOT NULL, -- e.g., "GCash", "BDO Savings", "Cash"
    type VARCHAR(20) NOT NULL CHECK (type IN ('Cash', 'Bank', 'E-Wallet')),
    account_number VARCHAR(100), -- Should be encrypted at application level (AES-256), masked for display. NULL for cash accounts.
    balance DECIMAL(15, 2) DEFAULT 0.00,
    verified BOOLEAN DEFAULT FALSE,
    logo_url VARCHAR(500), -- Logo of bank/e-wallet
    is_manual BOOLEAN DEFAULT TRUE, -- TRUE = user-declared, FALSE = API-connected
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- Store additional account-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ================================================
-- Table: categories
-- Description: Income and expense categories (user-specific)
-- NOTE: is_default = TRUE only for system-level categories (where user_id references a system user)
--       Custom user categories should have is_default = FALSE
-- ================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT FALSE, -- TRUE only for system default categories
    parent_id INTEGER, -- For subcategories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(user_id, name, type)
);

-- ================================================
-- Table: transactions
-- Description: Financial transactions (income/expense/transfer)
-- REMOVED: is_recurring (can be derived from recurring_parent_id - if NOT NULL, it's recurring)
-- ================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    receipt_url VARCHAR(500), -- Optional receipt image
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    recurring_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    recurring_parent_id INTEGER, -- References the original transaction for recurring ones (if NOT NULL, this is a recurring transaction)
    metadata JSONB, -- Store additional transaction data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (recurring_parent_id) REFERENCES transactions(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: transaction_transfers
-- Description: Links two transactions for transfers between accounts
-- ================================================
CREATE TABLE transaction_transfers (
    id SERIAL PRIMARY KEY,
    from_transaction_id INTEGER NOT NULL,
    to_transaction_id INTEGER NOT NULL,
    transfer_fee DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (to_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(from_transaction_id, to_transaction_id)
);

-- ================================================
-- Table: savings_allocations
-- Description: Track savings deposits and withdrawals
-- ================================================
CREATE TABLE savings_allocations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL, -- Account money comes from/goes to
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: user_pins
-- Description: User PIN storage for app security (always 6 digits)
-- REMOVED: pin_length (redundant - PIN is always 6 digits)
-- ================================================
CREATE TABLE user_pins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    pin_hash VARCHAR(255) NOT NULL, -- Must use bcrypt or argon2 hashing (recommended: argon2id)
    is_enabled BOOLEAN DEFAULT TRUE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: refresh_tokens
-- Description: JWT refresh tokens for authentication
-- ================================================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
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
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    entity_type VARCHAR(50), -- 'transaction', 'account', 'goal', etc.
    entity_id INTEGER, -- ID of the affected entity
    description TEXT,
    ip_address VARCHAR(45), -- Support IPv4 and IPv6
    user_agent TEXT,
    metadata JSONB, -- Additional data in JSON format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ================================================
-- Table: spending_limits
-- Description: User spending limits for Daily, Weekly, and Monthly budgets
-- ================================================
CREATE TABLE spending_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Daily', 'Weekly', 'Monthly')),
    amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (amount >= 0),
    current_spending NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (current_spending >= 0),
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(user_id, type)
);

-- ================================================
-- Indexes for Performance Optimization
-- ================================================

-- Institutions
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_institutions_supported ON institutions(is_supported);

-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX idx_users_active ON users(is_active);

-- Account queries (idx_accounts_user_id removed - redundant with idx_accounts_active)
-- CREATE INDEX idx_accounts_user_id ON accounts(user_id); -- REMOVED: Redundant with idx_accounts_active composite index
CREATE INDEX idx_accounts_institution_id ON accounts(institution_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_active ON accounts(user_id, is_active);
CREATE INDEX idx_accounts_manual ON accounts(is_manual);

-- Transaction queries (most frequently accessed)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_recurring ON transactions(recurring_parent_id);

-- Transfer queries
CREATE INDEX idx_transaction_transfers_from ON transaction_transfers(from_transaction_id);
CREATE INDEX idx_transaction_transfers_to ON transaction_transfers(to_transaction_id);

-- Category lookups
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_default ON categories(is_default);

-- Savings allocations
CREATE INDEX idx_savings_allocations_user_id ON savings_allocations(user_id);
CREATE INDEX idx_savings_allocations_account_id ON savings_allocations(account_id);
CREATE INDEX idx_savings_allocations_date ON savings_allocations(user_id, date DESC);
CREATE INDEX idx_savings_allocations_type ON savings_allocations(type);

-- User PINs
CREATE INDEX idx_user_pins_user_id ON user_pins(user_id);
CREATE INDEX idx_user_pins_locked ON user_pins(locked_until);

-- Refresh tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(is_revoked);

-- OTP verification
CREATE INDEX idx_otps_user_id ON otps(user_id);
CREATE INDEX idx_otps_code ON otps(code);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
CREATE INDEX idx_otps_purpose ON otps(purpose);

-- Activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Spending limits
CREATE INDEX idx_spending_limits_user_id ON spending_limits(user_id);
CREATE INDEX idx_spending_limits_type ON spending_limits(type);
CREATE INDEX idx_spending_limits_last_reset ON spending_limits(last_reset);

-- ================================================
-- Seed Data: Subscription Plans
-- ================================================

INSERT INTO plans (name, price, max_wallets, max_accounts, ai_enabled, ads_enabled, description, features) VALUES
(
  'Free', 
  0.00, 
  1, 
  1, 
  FALSE, 
  TRUE, 
  'For individuals just starting with budgeting.',
  ARRAY[
    'Connect 1 bank account',
    'Connect 1 e-wallet', 
    'Basic transaction categorization',
    'Net worth tracking',
    'Monthly spending summary'
  ]
),
(
  'Budgeet', 
  199.00, 
  5, 
  5, 
  TRUE, 
  FALSE, 
  'For users who want more control and smarter insights.',
  ARRAY[
    'Everything in Free',
    'Connect up to 5 accounts',
    'Advanced categorization rules',
    'AI-powered financial insights',
    'Export transactions to CSV/Excel',
    'Budget goals and alerts'
  ]
),
(
  'Premium', 
  399.00, 
  10, 
  15, 
  TRUE, 
  FALSE, 
  'Complete financial management suite.',
  ARRAY[
    'Everything in Budgeet',
    'Connect up to 15 accounts',
    'Advanced AI insights and predictions',
    'Multi-currency support',
    'Investment tracking',
    'Priority customer support',
    'Custom reports and analytics'
  ]
);

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

-- Shared function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update account balance when transactions change
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts 
        SET balance = balance + 
            CASE 
                WHEN NEW.type = 'income' THEN NEW.amount
                WHEN NEW.type = 'expense' THEN -NEW.amount
                ELSE 0 -- transfers handled separately
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Reverse old transaction
        UPDATE accounts 
        SET balance = balance - 
            CASE 
                WHEN OLD.type = 'income' THEN OLD.amount
                WHEN OLD.type = 'expense' THEN -OLD.amount
                ELSE 0
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.account_id;
        
        -- Apply new transaction
        UPDATE accounts 
        SET balance = balance + 
            CASE 
                WHEN NEW.type = 'income' THEN NEW.amount
                WHEN NEW.type = 'expense' THEN -NEW.amount
                ELSE 0
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.account_id;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE accounts 
        SET balance = balance - 
            CASE 
                WHEN OLD.type = 'income' THEN OLD.amount
                WHEN OLD.type = 'expense' THEN -OLD.amount
                ELSE 0
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.account_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update current spending when transactions change
CREATE OR REPLACE FUNCTION update_spending_limits_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    transaction_date DATE;
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' AND NEW.type = 'expense' AND NEW.status = 'completed' THEN
        transaction_date := NEW.date;
        
        -- Only update if transaction is from today (prevent backdated transactions from affecting current limits)
        IF transaction_date = CURRENT_DATE THEN
            -- Update Daily limit (only if not expired)
            UPDATE spending_limits
            SET 
                current_spending = current_spending + NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                user_id = NEW.user_id 
                AND type = 'Daily'
                AND last_reset >= CURRENT_DATE;
            
            -- Update Weekly limit (only if not expired)
            UPDATE spending_limits
            SET 
                current_spending = current_spending + NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                user_id = NEW.user_id 
                AND type = 'Weekly'
                AND last_reset >= CURRENT_DATE - INTERVAL '6 days';
            
            -- Update Monthly limit (only if same month)
            UPDATE spending_limits
            SET 
                current_spending = current_spending + NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                user_id = NEW.user_id 
                AND type = 'Monthly'
                AND DATE_TRUNC('month', last_reset) = DATE_TRUNC('month', CURRENT_DATE);
        END IF;
        
        RETURN NEW;
    END IF;

    -- Handle UPDATE
    IF TG_OP = 'UPDATE' AND NEW.type = 'expense' THEN
        -- Only process if transaction date is today
        IF OLD.date = CURRENT_DATE OR NEW.date = CURRENT_DATE THEN
            -- Reverse old transaction if it was completed and from today
            IF OLD.status = 'completed' AND OLD.date = CURRENT_DATE THEN
                UPDATE spending_limits
                SET 
                    current_spending = GREATEST(current_spending - OLD.amount, 0),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = OLD.user_id;
            END IF;
            
            -- Add new transaction if it's completed and is today
            IF NEW.status = 'completed' AND NEW.date = CURRENT_DATE THEN
                UPDATE spending_limits
                SET 
                    current_spending = current_spending + NEW.amount,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = NEW.user_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' AND OLD.type = 'expense' AND OLD.status = 'completed' AND OLD.date = CURRENT_DATE THEN
        UPDATE spending_limits
        SET 
            current_spending = GREATEST(current_spending - OLD.amount, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.user_id;
        
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to reset spending limits based on time elapsed
CREATE OR REPLACE FUNCTION reset_spending_limits()
RETURNS VOID AS $$
BEGIN
    -- Reset Daily limits (older than 24 hours)
    UPDATE spending_limits
    SET 
        current_spending = 0.00,
        last_reset = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        type = 'Daily' 
        AND last_reset < CURRENT_TIMESTAMP - INTERVAL '1 day';
    
    -- Reset Weekly limits (older than 7 days)
    UPDATE spending_limits
    SET 
        current_spending = 0.00,
        last_reset = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        type = 'Weekly' 
        AND last_reset < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- Reset Monthly limits (different month)
    UPDATE spending_limits
    SET 
        current_spending = 0.00,
        last_reset = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE 
        type = 'Monthly' 
        AND DATE_TRUNC('month', last_reset) < DATE_TRUNC('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

-- Function to initialize new users with defaults
CREATE OR REPLACE FUNCTION initialize_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default categories
    PERFORM create_default_categories_for_user(NEW.id);
    
    -- Create default spending limits
    PERFORM create_default_spending_limits_for_user(NEW.id);
    
    -- Create cash account
    PERFORM ensure_cash_account_for_user(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate account creation against plan limits
CREATE OR REPLACE FUNCTION validate_account_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan_id INTEGER;
    max_accounts_limit INTEGER;
    max_wallets_limit INTEGER;
    current_account_count INTEGER;
    current_wallet_count INTEGER;
BEGIN
    -- Get user's plan limits
    SELECT u.plan_id INTO user_plan_id
    FROM users u
    WHERE u.id = NEW.user_id;
    
    SELECT p.max_accounts, p.max_wallets INTO max_accounts_limit, max_wallets_limit
    FROM plans p
    WHERE p.id = user_plan_id;
    
    -- Count current accounts (excluding the one being inserted)
    SELECT COUNT(*) INTO current_account_count
    FROM accounts
    WHERE user_id = NEW.user_id AND is_active = TRUE;
    
    -- Check total account limit
    IF current_account_count >= max_accounts_limit THEN
        RAISE EXCEPTION 'Account limit reached. Your plan allows % accounts.', max_accounts_limit;
    END IF;
    
    -- Check wallet limit if creating a wallet
    IF NEW.type = 'E-Wallet' THEN
        SELECT COUNT(*) INTO current_wallet_count
        FROM accounts
        WHERE user_id = NEW.user_id AND type = 'E-Wallet' AND is_active = TRUE;
        
        IF current_wallet_count >= max_wallets_limit THEN
            RAISE EXCEPTION 'E-Wallet limit reached. Your plan allows % e-wallets.', max_wallets_limit;
        END IF;
    END IF;
    
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

CREATE TRIGGER update_savings_allocations_updated_at BEFORE UPDATE ON savings_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pins_updated_at BEFORE UPDATE ON user_pins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spending_limits_updated_at BEFORE UPDATE ON spending_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to initialize new users
CREATE TRIGGER new_user_initialization
    AFTER INSERT ON users
    FOR EACH ROW 
    EXECUTE FUNCTION initialize_new_user();

-- Trigger to validate account limits before creation
CREATE TRIGGER validate_account_limits_trigger
    BEFORE INSERT ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_limits();

-- Apply balance update trigger to transactions
CREATE TRIGGER transaction_balance_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Apply spending limit update trigger to transactions
CREATE TRIGGER transaction_spending_limit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW 
    EXECUTE FUNCTION update_spending_limits_on_transaction();

-- ================================================
-- Views for Common Queries
-- ================================================

-- User Dashboard Summary View (FIXED: No JOIN multiplication)
-- This view calculates financial metrics accurately by using separate subqueries
-- to avoid the JOIN multiplication problem that inflates totals.
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    p.name as plan_name,
    
    -- Account statistics (calculated separately to avoid JOIN multiplication)
    COALESCE(acc_stats.total_accounts, 0) as total_accounts,
    COALESCE(acc_stats.total_wallets, 0) as total_wallets,
    COALESCE(acc_stats.total_banks, 0) as total_banks,
    COALESCE(acc_stats.total_cash, 0) as total_cash,
    COALESCE(acc_stats.total_balance, 0) as total_balance,
    
    -- Transaction statistics (calculated separately)
    COALESCE(txn_stats.total_income, 0) as total_income,
    COALESCE(txn_stats.total_expenses, 0) as total_expenses,
    
    -- Savings statistics (calculated separately)
    COALESCE(sav_stats.total_savings, 0) as total_savings
    
FROM users u
LEFT JOIN plans p ON u.plan_id = p.id

-- Subquery for account statistics
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_accounts,
        COUNT(CASE WHEN type = 'E-Wallet' THEN 1 END) as total_wallets,
        COUNT(CASE WHEN type = 'Bank' THEN 1 END) as total_banks,
        COUNT(CASE WHEN type = 'Cash' THEN 1 END) as total_cash,
        SUM(balance) as total_balance
    FROM accounts
    WHERE is_active = TRUE
    GROUP BY user_id
) acc_stats ON u.id = acc_stats.user_id

-- Subquery for transaction statistics
LEFT JOIN (
    SELECT 
        user_id,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions
    WHERE status = 'completed'
    GROUP BY user_id
) txn_stats ON u.id = txn_stats.user_id

-- Subquery for savings statistics
LEFT JOIN (
    SELECT 
        user_id,
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END) as total_savings
    FROM savings_allocations
    GROUP BY user_id
) sav_stats ON u.id = sav_stats.user_id

WHERE u.is_active = TRUE;

-- Monthly Transaction Summary View
CREATE OR REPLACE VIEW monthly_transaction_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as monthly_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as monthly_expenses,
    COUNT(*) as transaction_count
FROM transactions 
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY user_id, month DESC;

-- Account Balance Summary View
CREATE OR REPLACE VIEW account_balance_summary AS
SELECT 
    a.user_id,
    a.type as account_type,
    COUNT(*) as account_count,
    SUM(a.balance) as total_balance,
    AVG(a.balance) as avg_balance
FROM accounts a
WHERE a.is_active = TRUE
GROUP BY a.user_id, a.type;

-- ================================================
-- Grant Permissions (if needed for specific user)
-- ================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO budgee_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO budgee_user;

-- ================================================
-- Seed Data: Default Categories Template
-- ================================================

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories_for_user(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Income Categories
    INSERT INTO categories (user_id, name, type, is_default) VALUES
    (p_user_id, 'Salary', 'income', TRUE),
    (p_user_id, 'Miscellaneous', 'income', TRUE);
    
    -- Expense Categories
    INSERT INTO categories (user_id, name, type, is_default) VALUES
    (p_user_id, 'Food', 'expense', TRUE),
    (p_user_id, 'Transportation', 'expense', TRUE),
    (p_user_id, 'Rent', 'expense', TRUE),
    (p_user_id, 'Utilities', 'expense', TRUE),
    (p_user_id, 'Entertainment', 'expense', TRUE),
    (p_user_id, 'Miscellaneous', 'expense', TRUE);
END;
$$ LANGUAGE plpgsql;

-- Function to create default spending limits for new users
CREATE OR REPLACE FUNCTION create_default_spending_limits_for_user(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO spending_limits (user_id, type, amount, current_spending, last_reset) 
    VALUES
        (p_user_id, 'Daily', 0.00, 0.00, CURRENT_TIMESTAMP),
        (p_user_id, 'Weekly', 0.00, 0.00, CURRENT_TIMESTAMP),
        (p_user_id, 'Monthly', 0.00, 0.00, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure cash account exists for user
CREATE OR REPLACE FUNCTION ensure_cash_account_for_user(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    cash_account_id INTEGER;
BEGIN
    -- Check if user already has a cash account
    SELECT id INTO cash_account_id 
    FROM accounts 
    WHERE user_id = p_user_id AND type = 'Cash' AND is_active = TRUE
    LIMIT 1;
    
    -- If no cash account exists, create one
    IF cash_account_id IS NULL THEN
        INSERT INTO accounts (user_id, name, type, balance, verified, is_active)
        VALUES (p_user_id, 'Cash', 'Cash', 0.00, TRUE, TRUE)
        RETURNING id INTO cash_account_id;
    END IF;
    
    RETURN cash_account_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Post-Setup: Initialize Existing Users
-- ================================================

-- Add default categories and cash accounts for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM users WHERE is_active = TRUE LOOP
        -- Create default categories
        PERFORM create_default_categories_for_user(user_record.id);
        
        -- Create default spending limits
        PERFORM create_default_spending_limits_for_user(user_record.id);
        
        -- Ensure cash account exists
        PERFORM ensure_cash_account_for_user(user_record.id);
    END LOOP;
END $$;

-- ================================================
-- Comments for Documentation
-- ================================================

COMMENT ON TABLE institutions IS 'Reference table for financial institutions (banks, e-wallets, credit providers)';
COMMENT ON TABLE plans IS 'Subscription plans with feature limits and pricing';
COMMENT ON TABLE users IS 'User accounts with authentication and profile data. New users automatically get default categories, spending limits, and cash account via trigger.';
COMMENT ON TABLE accounts IS 'Financial accounts including cash, bank, and e-wallets. Account creation is validated against plan limits via trigger.';
COMMENT ON TABLE categories IS 'User-defined transaction categories with hierarchical support';
COMMENT ON TABLE transactions IS 'All financial transactions including income, expense, and transfers';
COMMENT ON TABLE transaction_transfers IS 'Links transactions for account-to-account transfers';
COMMENT ON TABLE savings_allocations IS 'Tracks money moved to/from savings';
COMMENT ON TABLE user_pins IS 'Secure PIN storage for app authentication';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON TABLE otps IS 'One-time passwords for various verification purposes';
COMMENT ON TABLE activity_logs IS 'Comprehensive audit trail of user actions';
COMMENT ON TABLE spending_limits IS 'User spending limits for Daily, Weekly, and Monthly budgets with automatic reset tracking';

-- ================================================
-- SCHEMA CHANGE LOG
-- ================================================
-- Changes applied for optimization and normalization:
--
-- 1. REMOVED COLUMNS:
--    - users: verification_token, verification_token_expires, last_verification_sent (use otps table)
--    - accounts: last_four (can be derived from account_number)
--    - categories: changed is_default default from TRUE to FALSE (only system categories should be TRUE)
--    - transactions: is_recurring (can be derived from recurring_parent_id)
--    - user_pins: pin_length (redundant - always 6 digits)
--
-- 2. ADDED TABLES:
--    - institutions: Reference table for banks, e-wallets, and other financial institutions
--
-- 3. MODIFIED TABLES:
--    - accounts: Added institution_id FK, is_manual column for tracking API vs manual accounts
--    - users: Added unique constraint for (oauth_provider, oauth_id)
--
-- 4. OPTIMIZED:
--    - Consolidated update_updated_at_column() trigger function (shared across all tables)
--    - Added indexes for new columns (institution_id, is_manual, is_default)
--    - Updated recurring transaction index to use recurring_parent_id only
--    - Removed idx_accounts_user_id (redundant with idx_accounts_active composite index)
--
-- 5. FIXED:
--    - Added initialize_new_user() trigger to automatically set up new users
--    - Fixed update_spending_limits_on_transaction() to only process today's transactions
--    - Added validate_account_limits() trigger to enforce plan limits
--    - Clarified transfer transaction handling in update_account_balance()
--
-- 6. SECURITY:
--    - Added documentation for encryption (account_number: AES-256)
--    - Added documentation for hashing (password_hash, pin_hash: argon2id recommended)
--    - Added unique constraint for OAuth provider/ID combination
-- ================================================

-- ================================================
-- Security and Constraints
-- ================================================

-- Row Level Security (Optional - Enable if needed)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE savings_allocations ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (Uncomment to enable)
-- CREATE POLICY user_data_policy ON users FOR ALL USING (id = current_user_id());
-- CREATE POLICY account_data_policy ON accounts FOR ALL USING (user_id = current_user_id());

-- ================================================
-- Performance Analysis Queries
-- ================================================

-- Query to analyze table sizes
-- SELECT 
--     schemaname,
--     tablename,
--     attname,
--     n_distinct,
--     correlation
-- FROM pg_stats
-- WHERE schemaname = 'public'
-- ORDER BY tablename, attname;

-- ================================================
-- Backup and Maintenance
-- ================================================

-- Cleanup old OTPs (run periodically)
-- DELETE FROM otps WHERE expires_at < NOW() - INTERVAL '1 day';

-- Cleanup old refresh tokens (run periodically) 
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = TRUE;

-- Cleanup old activity logs (optional - keep last 90 days)
-- DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- ================================================
-- End of Schema
-- ================================================

-- Verification Queries (Run these to verify setup)
/*
-- Check all tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check all constraints
SELECT conname, contype, confupdtype, confdeltype 
FROM pg_constraint 
WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY conname;

-- Check all indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Verify plans data
SELECT * FROM plans;

-- Test user creation with defaults
INSERT INTO users (name, email, password_hash) VALUES ('Test User', 'test@example.com', 'hashed_password');
SELECT u.name, COUNT(c.id) as categories, COUNT(a.id) as accounts 
FROM users u 
LEFT JOIN categories c ON u.id = c.user_id 
LEFT JOIN accounts a ON u.id = a.user_id 
WHERE u.email = 'test@example.com'
GROUP BY u.id, u.name;
*/
