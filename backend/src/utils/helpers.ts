import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain text password with hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a random 6-digit OTP code
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Generate OTP expiration time (default: 10 minutes from now)
 */
export const getOTPExpiration = (minutes: number = 10): Date => {
  // Use timestamp-based calculation for more reliable expiration
  const now = Date.now();
  const expirationTime = now + (minutes * 60 * 1000); // minutes to milliseconds
  return new Date(expirationTime);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Philippine format)
 */
export const isValidPhone = (phone: string): boolean => {
  // Accepts formats: 09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX
  const phoneRegex = /^(\+?63|0)?9\d{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Sanitize user object (remove sensitive data)
 */
export const sanitizeUser = (user: Record<string, unknown>): Omit<Record<string, unknown>, 'password_hash'> => {
  // Handle both Sequelize models and plain objects
  const userObj = typeof (user as { toJSON?: () => unknown }).toJSON === 'function' 
    ? (user as { toJSON: () => Record<string, unknown> }).toJSON() 
    : user;
  
  const { password_hash, ...sanitized } = userObj as Record<string, unknown> & { password_hash?: string };
  return sanitized;
};

/**
 * Format currency (Philippine Peso)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

/**
 * Calculate date range for filters
 */
export const getDateRange = (
  period: 'today' | 'week' | 'month' | 'year'
): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};

/**
 * Generate a random string (for tokens, etc.)
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Mask account number (show only last 4 digits)
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) {
    return '****';
  }
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
};

/**
 * Check if user has AI Buddy access (30 days from subscription upgrade)
 * @param user User object with plan and subscription_upgraded_at
 * @returns boolean indicating if AI Buddy is available
 */
export const hasAIBuddyAccess = (user: {
  plan?: { ai_enabled: boolean };
  subscription_upgraded_at?: string | Date | null;
}): boolean => {
  // If plan has AI enabled permanently, return true
  if (user.plan?.ai_enabled) {
    return true;
  }

  // Check if user has upgraded within the last 30 days
  if (user.subscription_upgraded_at) {
    const upgradeDate = new Date(user.subscription_upgraded_at);
    const now = new Date();
    const daysSinceUpgrade = (now.getTime() - upgradeDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Grant access for 30 days after upgrade
    return daysSinceUpgrade <= 30;
  }

  return false;
};
