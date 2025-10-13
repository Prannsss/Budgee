import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        plan_id: number;
      };
    }
  }
}

interface JWTPayload {
  id: number;
  email: string;
  plan_id: number;
}

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is missing',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan_id: decoded.plan_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication - continues even if no token
 * Useful for routes that work differently for authenticated users
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan_id: decoded.plan_id,
    };

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

/**
 * Generate JWT token for user  
 */
export const generateToken = (user: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      plan_id: user.plan_id,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );
};

/**
 * Generate refresh token (longer expiry)
 */
export const generateRefreshToken = (userId: number): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: '30d' } as any
  );
};
