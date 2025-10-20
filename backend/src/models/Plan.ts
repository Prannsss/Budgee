import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';

// Plan attributes interface
export interface PlanAttributes {
  id: number;
  name: string;
  price: number;
  max_wallets: number;
  max_accounts: number;
  ai_enabled: boolean;
  ads_enabled: boolean;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface PlanCreationAttributes extends Omit<PlanAttributes, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Plan Model
class Plan extends Model<PlanAttributes, PlanCreationAttributes> implements PlanAttributes {
  public id!: number;
  public name!: string;
  public price!: number;
  public max_wallets!: number;
  public max_accounts!: number;
  public ai_enabled!: boolean;
  public ads_enabled!: boolean;
  public description?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    max_wallets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    max_accounts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    ai_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ads_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'plans',
    timestamps: true,
    underscored: true,
  }
);

export default Plan;
