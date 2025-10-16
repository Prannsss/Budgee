// Import all models
import Plan from './Plan';
import User from './User';
import Account from './Account';
import Category from './Category';
import Transaction from './Transaction';
import OTP from './OTP';
import ActivityLog from './ActivityLog';
import SavingsAllocation from './SavingsAllocation';
import UserPin from './UserPin';
import SpendingLimit from './SpendingLimit';

// ================================================
// Define Model Associations
// ================================================

// User belongs to Plan
User.belongsTo(Plan, {
  foreignKey: 'plan_id',
  as: 'plan',
});

// Plan has many Users
Plan.hasMany(User, {
  foreignKey: 'plan_id',
  as: 'users',
});

// User has many Accounts
User.hasMany(Account, {
  foreignKey: 'user_id',
  as: 'accounts',
  onDelete: 'CASCADE',
});

// Account belongs to User
Account.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many Categories
User.hasMany(Category, {
  foreignKey: 'user_id',
  as: 'categories',
  onDelete: 'CASCADE',
});

// Category belongs to User
Category.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many Transactions
User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions',
  onDelete: 'CASCADE',
});

// Transaction belongs to User
Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Account has many Transactions
Account.hasMany(Transaction, {
  foreignKey: 'account_id',
  as: 'transactions',
  onDelete: 'CASCADE',
});

// Transaction belongs to Account
Transaction.belongsTo(Account, {
  foreignKey: 'account_id',
  as: 'account',
});

// Category has many Transactions
Category.hasMany(Transaction, {
  foreignKey: 'category_id',
  as: 'transactions',
});

// Transaction belongs to Category
Transaction.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// User has many OTPs
User.hasMany(OTP, {
  foreignKey: 'user_id',
  as: 'otps',
  onDelete: 'CASCADE',
});

// OTP belongs to User
OTP.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many ActivityLogs
User.hasMany(ActivityLog, {
  foreignKey: 'user_id',
  as: 'activity_logs',
  onDelete: 'CASCADE',
});

// ActivityLog belongs to User
ActivityLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many SavingsAllocations
User.hasMany(SavingsAllocation, {
  foreignKey: 'user_id',
  as: 'savings_allocations',
  onDelete: 'CASCADE',
});

// SavingsAllocation belongs to User
SavingsAllocation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Account has many SavingsAllocations
Account.hasMany(SavingsAllocation, {
  foreignKey: 'account_id',
  as: 'savings_allocations',
  onDelete: 'CASCADE',
});

// SavingsAllocation belongs to Account
SavingsAllocation.belongsTo(Account, {
  foreignKey: 'account_id',
  as: 'account',
});

// User has one UserPin
User.hasOne(UserPin, {
  foreignKey: 'user_id',
  as: 'pin',
  onDelete: 'CASCADE',
});

// UserPin belongs to User
UserPin.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User has many SpendingLimits
User.hasMany(SpendingLimit, {
  foreignKey: 'user_id',
  as: 'spending_limits',
  onDelete: 'CASCADE',
});

// SpendingLimit belongs to User
SpendingLimit.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// ================================================
// Export all models
// ================================================

export {
  Plan,
  User,
  Account,
  Category,
  Transaction,
  OTP,
  ActivityLog,
  SavingsAllocation,
  UserPin,
  SpendingLimit,
};

// Default export as object for convenience
export default {
  Plan,
  User,
  Account,
  Category,
  Transaction,
  OTP,
  ActivityLog,
  SavingsAllocation,
  UserPin,
  SpendingLimit,
};
