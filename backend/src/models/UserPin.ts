import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserPinAttributes {
  id: number;
  user_id: number;
  pin_hash: string;
  is_enabled: boolean;
  failed_attempts: number;
  locked_until: Date | null;
  last_used: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface UserPinCreationAttributes extends Optional<UserPinAttributes, 'id' | 'is_enabled' | 'failed_attempts' | 'locked_until' | 'last_used' | 'created_at' | 'updated_at'> {}

class UserPin extends Model<UserPinAttributes, UserPinCreationAttributes> implements UserPinAttributes {
  public id!: number;
  public user_id!: number;
  public pin_hash!: string;
  public is_enabled!: boolean;
  public failed_attempts!: number;
  public locked_until!: Date | null;
  public last_used!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserPin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    pin_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_used: {
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
    tableName: 'user_pins',
    timestamps: true,
    underscored: true,
  }
);

export default UserPin;
