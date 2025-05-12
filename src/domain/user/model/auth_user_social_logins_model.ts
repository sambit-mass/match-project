import { DataTypes } from "sequelize";
import { Model } from "../../../model";

export class AuthUserSocialLoginModel extends Model {
    constructor() {
        super(
            'auth_user_social_logins',
            {
                auth_user_social_login_id: {
                    type: DataTypes.BIGINT.UNSIGNED,
                    primaryKey: true,
                    autoIncrement: true,
                },
                fk_auth_user_id: {
                    type: DataTypes.BIGINT,
                },
                social_id: {
                    type: DataTypes.STRING(1000),
                },
                social_token: {
                    type: DataTypes.STRING(1000),
                },
                social_type: {
                    type: DataTypes.TINYINT,
                },
                created_at: {
                    type: DataTypes.DATE,
                },
                updated_at: {
                    type: DataTypes.DATE,
                },
            },
            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'auth_user_social_logins',
            },
        );
    }

};
