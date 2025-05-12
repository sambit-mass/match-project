'use strict';
import { DataTypes } from "sequelize";
import { Model } from "../../../model"

export class UserOtpTrailsModel extends Model {
    constructor() {
        super(
            'user_otp_trails',
            {
                otp_trail_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_email: {
                    type: DataTypes.STRING(255),
                },
                user_type: {
                    type: DataTypes.TINYINT,
                },
                otp_purpose: {
                    type: DataTypes.TINYINT,
                },
                created_at: {
                    type: DataTypes.DATE,
                }
            },
            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'user_otp_trails'
            },
        )
    }
}
