import { Sequelize } from 'sequelize';
import databaseConfig from './database';

// Initialize Sequelize instance
const sequelize = new Sequelize(
  databaseConfig.database!,
  databaseConfig.username!,
  databaseConfig.password!,
  {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    logging: databaseConfig.logging,
    pool: databaseConfig.pool,
    dialectOptions: databaseConfig.dialectOptions,
  }
);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;
