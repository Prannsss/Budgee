import dotenv from 'dotenv';
import createApp from './app';
import { testSupabaseConnection } from './config/supabase';
import { verifyEmailConnection } from './utils/email.service';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Test Supabase database connection
    const supabaseConnected = await testSupabaseConnection();
    if (!supabaseConnected) {
      console.warn('⚠️  Supabase connection failed, but continuing...');
    }

    // Verify email service connection
    await verifyEmailConnection();

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 Budgee Backend Server Started (Supabase)');
      console.log('='.repeat(50));
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: Supabase (${process.env.SUPABASE_URL})`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
