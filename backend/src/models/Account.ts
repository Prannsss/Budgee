import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';

// Account attributes interface
export interface AccountAttributes {
  id: number;
  user_id: number;
  name: string;
  type: 'Cash' | 'Bank' | 'E-Wallet';
  account_number?: string;
  balance: number;
  verified: boolean;
  logo_url?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface AccountCreationAttributes 
  extends Optional<AccountAttributes, 'id' | 'balance' | 'verified' | 'is_active' | 'created_at' | 'updated_at'> {}

// Account Model
class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public type!: 'Cash' | 'Bank' | 'E-Wallet';
  public account_number?: string;
  public balance!: number;
  public verified!: boolean;
  public logo_url?: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly user?: User;
}

Account.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Cash', 'Bank', 'E-Wallet'),
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
  }
);

export default Account;
