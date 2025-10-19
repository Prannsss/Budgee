import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

// SpendingLimit attributes interface
export interface SpendingLimitAttributes {
  id: number;
  user_id: number;
  type: 'Daily' | 'Weekly' | 'Monthly';
  amount: number;
  current_spending: number;
  last_reset: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface SpendingLimitCreationAttributes
  extends Optional<SpendingLimitAttributes, 'id' | 'amount' | 'current_spending' | 'last_reset' | 'created_at' | 'updated_at'> {}

// SpendingLimit Model
class SpendingLimit extends Model<SpendingLimitAttributes, SpendingLimitCreationAttributes> implements SpendingLimitAttributes {
  public id!: number;
  public user_id!: number;
  public type!: 'Daily' | 'Weekly' | 'Monthly';
  public amount!: number;
  public current_spending!: number;
  public last_reset!: Date;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Method to check if limit is exceeded
  public isExceeded(): boolean {
    // If limit is 0 or not set, never exceeded
    if (this.amount <= 0) return false;
    return this.current_spending >= this.amount;
  }

  // Method to check if warning threshold (80%) is reached
  public isNearLimit(): boolean {
    // If limit is 0 or not set, never near limit
    if (this.amount <= 0) return false;
    return this.current_spending >= this.amount * 0.8;
  }

  // Method to get percentage used
  public getPercentageUsed(): number {
    // If limit is 0 or not set, return 0
    if (this.amount <= 0) return 0;
    return Math.min((this.current_spending / this.amount) * 100, 100);
  }

  // Method to get remaining amount
  public getRemainingAmount(): number {
    // If limit is 0 or not set, return 0
    if (this.amount <= 0) return 0;
    return Math.max(this.amount - this.current_spending, 0);
  }
}

// Initialize Model
SpendingLimit.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['Daily', 'Weekly', 'Monthly']],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    current_spending: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
      },
    },
    last_reset: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'spending_limits',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['last_reset'],
      },
      {
        unique: true,
        fields: ['user_id', 'type'],
      },
    ],
  }
);

export default SpendingLimit;
