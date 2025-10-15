import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';
import Account from './Account';

// SavingsAllocation attributes interface
export interface SavingsAllocationAttributes {
  id: number;
  user_id: number;
  savings_goal_id?: number;
  account_id: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface SavingsAllocationCreationAttributes 
  extends Optional<SavingsAllocationAttributes, 'id' | 'savings_goal_id' | 'created_at' | 'updated_at'> {}

// SavingsAllocation Model
class SavingsAllocation extends Model<SavingsAllocationAttributes, SavingsAllocationCreationAttributes> 
  implements SavingsAllocationAttributes {
  public id!: number;
  public user_id!: number;
  public savings_goal_id?: number;
  public account_id!: number;
  public amount!: number;
  public type!: 'deposit' | 'withdrawal';
  public description!: string;
  public date!: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly user?: User;
  public readonly account?: Account;
}

SavingsAllocation.init(
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
    savings_goal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'savings_goals',
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
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdrawal'),
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
    tableName: 'savings_allocations',
    timestamps: true,
    underscored: true,
  }
);

export default SavingsAllocation;
