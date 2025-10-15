import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';

// SavingsGoal attributes interface
export interface SavingsGoalAttributes {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface SavingsGoalCreationAttributes 
  extends Optional<SavingsGoalAttributes, 'id' | 'current_amount' | 'is_active' | 'created_at' | 'updated_at'> {}

// SavingsGoal Model
class SavingsGoal extends Model<SavingsGoalAttributes, SavingsGoalCreationAttributes> 
  implements SavingsGoalAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public target_amount!: number;
  public current_amount!: number;
  public target_date?: Date;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly user?: User;
}

SavingsGoal.init(
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
    target_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    current_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
    },
    target_date: {
      type: DataTypes.DATEONLY,
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
    tableName: 'savings_goals',
    timestamps: true,
    underscored: true,
  }
);

export default SavingsGoal;
