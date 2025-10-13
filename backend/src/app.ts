import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

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
  app.get('/', (_, res) => {
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
