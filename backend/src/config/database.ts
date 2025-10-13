import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  dialect: 'postgres';
  logging?: boolean;
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const config: DatabaseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'budgee_dev',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Production configuration
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Parse DATABASE_URL if provided
  const dbUrl = new URL(process.env.DATABASE_URL);
  config.username = dbUrl.username;
  config.password = dbUrl.password;
  config.host = dbUrl.hostname;
  config.port = parseInt(dbUrl.port);
  config.database = dbUrl.pathname.slice(1);
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

export default config;
