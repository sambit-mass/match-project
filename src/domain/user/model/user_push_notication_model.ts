'use strict';
import { DataTypes } from "sequelize";
import { Model } from "../../../model"

export class UserPushNotificationModel extends Model {
    constructor() {
        super(
            'user_push_notication',
            {
                notification_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true
                },
                fk_auth_user_id: {
                    type: DataTypes.BIGINT,
                },
                action_id: {
                    type: DataTypes.STRING(250),
                },
                send_to_device_type: {
                    type: DataTypes.TINYINT,
                },
                message: {
                    type: DataTypes.TEXT,
                },
                device_uid: {
                    type: DataTypes.STRING(250),
                },
                read_status: {
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
                tableName: 'user_push_notication'
            },
        )
    }
}
