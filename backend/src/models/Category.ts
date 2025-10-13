import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';

// Category attributes interface
export interface CategoryAttributes {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_default: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Optional fields for creation
interface CategoryCreationAttributes 
  extends Optional<CategoryAttributes, 'id' | 'is_default' | 'created_at' | 'updated_at'> {}

// Category Model
class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public type!: 'income' | 'expense';
  public icon?: string;
  public color?: string;
  public is_default!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association helpers
  public readonly user?: User;
}

Category.init(
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
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'name', 'type'],
      },
    ],
  }
);

export default Category;
