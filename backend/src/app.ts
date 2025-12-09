import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // ================================================
  // Security & Performance Middleware
  // ================================================

  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // Initialize Passport for OAuth
  app.use(passport.initialize());

  // Rate limiting - separate limiters for different endpoints
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 5000 : 500, // Much higher limits
    message: { 
      success: false, 
      message: 'Too many requests from this IP, please try again later.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for certain paths
    skip: (req) => {
      // Don't rate limit health checks
      return req.path === '/api/health';
    },
  });

  // Stricter limiter for auth endpoints to prevent brute force
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 20, // 20 login attempts per 15 min
    message: { 
      success: false, 
      message: 'Too many login attempts from this IP, please try again in 15 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply general limiter to all API routes
  app.use('/api/', generalLimiter);
  
  // Apply stricter limiter to auth login/signup routes
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/signup', authLimiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression middleware
  app.use(compression());

  // Request logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ================================================
  // Routes
  // ================================================

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Welcome to Budgee API - Your Finance Buddy',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  // API routes
  app.use('/api', routes);

  // ================================================
  // Error Handling
  // ================================================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
