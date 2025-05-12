'use strict';
import { DataTypes, Sequelize, Op, fn, col } from "sequelize";
import { Model } from "../../../model"
import { AuthUserLoginModel } from "./auth_user_login_model";
import { AuthUserSocialLoginModel } from "./auth_user_social_logins_model";

export class AuthUserModel extends Model {
    constructor() {
        super(
            'auth_users',
            {
                auth_user_id: {
                    type: DataTypes.BIGINT,
                    primaryKey: true,
                    autoIncrement: true
                },
                unique_id: {
                    type: DataTypes.STRING(15),
                    unique: true
                },
                user_email: {
                    type: DataTypes.STRING(255),
                },
                user_pwd: {
                    type: DataTypes.STRING(255),
                },
                user_type: {
                    type: DataTypes.TINYINT,
                },
                user_status: {
                    type: DataTypes.TINYINT,
                },
                registration_status: {
                    type: DataTypes.TINYINT,
                },
                is_selfie_verified: {
                    type: DataTypes.TINYINT,
                },
                photo_updated_datetime: {
                    type: DataTypes.DATE,
                },
                added_datetime: {
                    type: DataTypes.DATE,
                },
                modified_datetime: {
                    type: DataTypes.DATE,
                }
            },
            {
                timestamps: false,
                freezeTableName: true,
                tableName: 'auth_users'
            },
        )
    }

    public associateWithAuthUserSocialLoginModel() {
        let authUserSocialLoginModel = new AuthUserSocialLoginModel();
        //MAKING ASSOCIATIONS OF MODELS
        this.Model.hasOne(authUserSocialLoginModel.Model, { foreignKey: 'fk_auth_user_id' });
        return authUserSocialLoginModel;
    }

    public fetchUserDetailsByEmail(userEmail: string) {
        return this.Model.findOne({
            attributes: ['auth_user_id', 'user_type'],
            where: {
                user_email: userEmail,
                user_status: {
                    [Op.ne]: 0 // 0 => Exclude those whos are in inactive state 
                }
            },
            subQuery: false,
            raw: true
        })
    }

    public fetchUserDetailsByAuthUserId(userId: number) {

        return this.Model.findOne({
            attributes: [
                'user_pwd',
                'user_type',
                [Sequelize.col('user_detail.user_first_name'), 'user_first_name'],
            ],
            include: [
                {
                    /* attributes: ['user_email'],
                    model: associateWithUserDetailsModel.Model,
                    required: true */
                }
            ],
            where: {
                auth_user_id: userId,
                user_status: {
                    [Op.ne]: 0 // Exclude inactive users
                }
            },
            subQuery: false,
        })
    }

    public associateWithAuthUserLoginModel() {
        let authUserLoginModel = new AuthUserLoginModel();
        //MAKING ASSOCIATIONS OF MODELS
        this.Model.hasMany(authUserLoginModel.Model, { foreignKey: 'fk_auth_user_id' });
        return authUserLoginModel;
    }

    checkForValidLoggedInUserByDeviceId(userId: number, deviceUid: string) {
        let associateWithAuthUserLoginModel = this.associateWithAuthUserLoginModel();

        return this.Model.findOne({
            attributes: [
                [fn('COALESCE', col('auth_user_logins.device_os'), ''), 'device_os'],
                [fn('COALESCE', col('auth_user_logins.device_uid'), ''), 'device_uid']
            ],
            include: [
                {
                    attributes: [],
                    model: associateWithAuthUserLoginModel.Model,
                    required: true,
                    where: {
                        device_uid: deviceUid
                    }
                }
            ],
            where: {
                auth_user_id: userId,
                user_status: 1
            },
            subQuery: false,
            raw: true
        })
    }

    public getUserDetailsBySocialId(socialId: string | undefined) {
        let associateWithAuthUserSocialLoginModel = this.associateWithAuthUserSocialLoginModel();

        return this.Model.findOne({
            attributes: ['auth_user_id', 'user_email', 'user_status'],
            include: [
                {
                    attributes: [],
                    model: associateWithAuthUserSocialLoginModel.Model,
                    required: true,
                    where: {
                        social_id: socialId
                    },
                }
            ],
            raw: true
        })
    }
}
