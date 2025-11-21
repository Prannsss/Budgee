import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';
import Plan from './Plan';

// User attributes interface
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  plan_id: number;
  avatar_url?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  oauth_provider?: string;
  oauth_id?: string;
  last_login?: Date;
  subscription_upgraded_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface UserCreationAttributes 
  extends Omit<UserAttributes, 'id' | 'plan_id' | 'email_verified' | 'phone_verified' | 'is_active' | 'created_at' | 'updated_at'> {
    id?: number;
    plan_id?: number;
    email_verified?: boolean;
    phone_verified?: boolean;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }

// User Model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public password_hash!: string;
  public plan_id!: number;
  public avatar_url?: string;
  public email_verified!: boolean;
  public phone_verified!: boolean;
  public is_active!: boolean;
  public oauth_provider?: string;
  public oauth_id?: string;
  public last_login?: Date;
  public subscription_upgraded_at?: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly plan?: Plan;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'plans',
        key: 'id',
      },
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    oauth_provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    oauth_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscription_upgraded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
  }
);

export default User;
