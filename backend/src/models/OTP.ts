import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import User from './User';

// OTP attributes interface
export interface OTPAttributes {
  id: number;
  user_id: number;
  code: string;
  purpose: string;
  expires_at: Date;
  is_verified: boolean;
  attempts: number;
  max_attempts: number;
  created_at?: Date;
}

// Optional fields for creation
interface OTPCreationAttributes 
  extends Optional<OTPAttributes, 'id' | 'is_verified' | 'attempts' | 'max_attempts' | 'created_at'> {}

// OTP Model
class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  public id!: number;
  public user_id!: number;
  public code!: string;
  public purpose!: string;
  public expires_at!: Date;
  public is_verified!: boolean;
  public attempts!: number;
  public max_attempts!: number;

  public readonly created_at!: Date;

  // Association helpers
  public readonly user?: User;
}

OTP.init(
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
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: false,
    underscored: true,
  }
);

export default OTP;
