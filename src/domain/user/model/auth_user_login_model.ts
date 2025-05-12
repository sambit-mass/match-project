import { DataTypes } from "sequelize";
import { Model } from "../../../model";

export class AuthUserLoginModel extends Model {
    constructor() {
        super(
            'auth_user_login',
            {
                auth_user_login_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true,
                },
                fk_auth_user_id: {
                    type: DataTypes.BIGINT,
                },
                browser_id: {
                    type: DataTypes.STRING(250),
                },
                browser_version: {
                    type: DataTypes.STRING(50),
                },
                session_id: {
                    type: DataTypes.STRING(250),
                },
                browser_name: {
                    type: DataTypes.STRING(80),
                },
                app_version: {
                    type: DataTypes.STRING(10),
                },
                device_uid: {
                    type: DataTypes.STRING(50),
                },
                device_token: {
                    type: DataTypes.STRING(200),
                },
                device_name: {
                    type: DataTypes.STRING(50),
                },
                device_model: {
                    type: DataTypes.STRING(10),
                },
                device_version: {
                    type: DataTypes.STRING(10),
                },
                device_os: {
                    type: DataTypes.TINYINT,
                },
                is_logged_in: {
                    type: DataTypes.TINYINT,
                },
                added_timestamp: {
                    type: DataTypes.DATE,
                },
                modified_tiemstamp: {
                    type: DataTypes.DATE,
                    defaultValue: null,
                },
            },
            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'auth_user_login'
            }
        );
    }

};
