import { Model, DataTypes } from 'sequelize';
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
  description: string;
  date: Date;
  notes?: string;
  receipt_url?: string;
  status: string;
  recurring_frequency?: string;
  recurring_parent_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface TransactionCreationAttributes 
  extends Omit<TransactionAttributes, 'id' | 'created_at' | 'updated_at'> {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
  }

// Transaction Model
class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public user_id!: number;
  public account_id!: number;
  public category_id!: number;
  public type!: 'income' | 'expense';
  public amount!: number;
  public description!: string;
  public date!: Date;
  public notes?: string;
  public receipt_url?: string;
  public status!: string;
  public recurring_frequency?: string;
  public recurring_parent_id?: number;

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
    description: {
      type: DataTypes.TEXT,
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
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'completed',
    },
    recurring_frequency: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    recurring_parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'transactions',
        key: 'id',
      },
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
