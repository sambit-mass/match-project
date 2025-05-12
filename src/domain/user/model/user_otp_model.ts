'use strict';
import { DataTypes } from "sequelize";
import { Model } from "../../../model"

export class UserOtpModel extends Model {
    constructor() {
        super(
            'user_otp',
            {
                user_otp_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_email: {
                    type: DataTypes.STRING(255),
                },
                otp: {
                    type: DataTypes.INTEGER,
                },
                user_type: {
                    type: DataTypes.TINYINT,
                },
                otp_purpose: {
                    type: DataTypes.TINYINT,
                },
                created_at: {
                    type: DataTypes.DATE,
                },
                updated_at: {
                    type: DataTypes.DATE,
                }
            },
            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'user_otp'
            },
        )
    }
}
