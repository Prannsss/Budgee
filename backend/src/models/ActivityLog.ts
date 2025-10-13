import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';

// ActivityLog attributes interface
export interface ActivityLogAttributes {
  id: number;
  user_id: number;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: object;
  created_at?: Date;
}

// Optional fields for creation
interface ActivityLogCreationAttributes 
  extends Optional<ActivityLogAttributes, 'id' | 'created_at'> {}

// ActivityLog Model
class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public description?: string;
  public ip_address?: string;
  public user_agent?: string;
  public metadata?: object;

  public readonly created_at!: Date;

  // Association helpers
  public readonly user?: User;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: false,
    underscored: true,
  }
);

export default ActivityLog;
