import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';
import Account from './Account';
import Category from './Category';

// Transaction attributes interface
export interface TransactionAttributes {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  notes?: string;
  receipt_url?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface TransactionCreationAttributes 
  extends Optional<TransactionAttributes, 'id' | 'is_recurring' | 'created_at' | 'updated_at'> {}

// Transaction Model
class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public user_id!: number;
  public account_id!: number;
  public category_id!: number;
  public type!: 'income' | 'expense';
  public amount!: number;
  public date!: Date;
  public notes?: string;
  public receipt_url?: string;
  public is_recurring!: boolean;
  public recurring_frequency?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly user?: User;
  public readonly account?: Account;
  public readonly category?: Category;
}

Transaction.init(
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
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    receipt_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurring_frequency: {
      type: DataTypes.STRING(20),
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
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
  }
);

export default Transaction;
