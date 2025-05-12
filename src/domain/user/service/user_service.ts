import { IUserRegistration, IVerifyOtp, ISendOtp, IForgotPasswordReq, IChangePasswordReq, IWhereObject, IGenerateAuthCodeReq, IGenerateTokenReq, IGenerateAuthCodeObj, IUpdateUserProfileReq, ICheckSocialLoginExists, IAllNotificationsListReq, IUnreadNotificationCountReq, ILogoutReq, IAnswerSave, IgetQuestionsReq, IgetAnswersReq, IdeletProfileImage, IprofileImages, IprofileImage, IfrontendUserRegistration, IuserActivityData, ImainAnswerSave, IrecommendedProfile, IuserData, IgetProfile, IuserActivitiesData, IgetAllImages, IuserImages, IcomparePose } from "../interface/user_interface";

import { gRPCMainServer } from "../../../grpc_client";
import { JWTHelper } from "../../../helper/jwt_helper";
import { AuthUserModel } from "../model/auth_users_model";
import { UserOtpModel } from "../model/user_otp_model";
import { Op, Sequelize } from "sequelize";
import { s3_folder_path } from "../../file/file_config";
import { image_service } from "../../file/service/file_service";
import { AuthUserSocialLoginModel } from "../model/auth_user_social_logins_model";
import { AuthUserLoginModel } from "../model/auth_user_login_model";
import { UserPushNotificationModel } from "../model/user_push_notication_model";
import { UserProfileBasics } from "../model/user_profile_basics_model";
import { UserAnswers } from "../model/user_answers_model";
import { MasterProfileQuestion } from "../model/master_profile_questions_model";
import { PipelineStage } from "mongoose";
import { UserProfileImages } from "../model/user_profile_images_model";
import * as fs from 'fs';
import { USER_CONFIGS } from "../user_config";
import { RabbitMQHelper } from "../../../helper/rabbitMQ_helper";
import { UserProfileActivities } from "../model/user_profile_activities_model";
import { UserOtpTrailsModel } from "../model/user_otp_trails_model";
import { S3Helper } from "../../../helper/awsS3_helper";
export class UserService {
    private _grpcClient = gRPCMainServer;
    private _jwtHelper = new JWTHelper()
    private _authUserModel = new AuthUserModel();
    private _userOtpModel = new UserOtpModel();
    private _image_service = new image_service();
    private _authUserSocialLoginModel = new AuthUserSocialLoginModel();
    private _userPushNotificationModel = new UserPushNotificationModel();
    private _authUserLoginModel = new AuthUserLoginModel();
    private _userProfileBasicsModel = new UserProfileBasics();
    private _userAnswersModel = new UserAnswers();
    private _masterProfileQuestion = new MasterProfileQuestion()
    private _userProfileImages = new UserProfileImages();
    private _rabbitMqHelper = new RabbitMQHelper();
    private _userProfileActivities = new UserProfileActivities();
    private _userOpTrailsModel = new UserOtpTrailsModel();
    private _S3Helper = new S3Helper()
    constructor() { }

    // INITIALIZE LOG OBJECT
    initLog() {
        global.logs.logObj.file_name = "V1-UserService";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: User email existence checking in "auth_users" table. send TRUE if exists else FALSE. This function is also usable for additional where parameters.
    */
    userEmailExistenceChecking = async (userEmail: string, additionalWhereParam?: any): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'userEmailExistenceChecking - ' + global.Helpers.getTraceID({ userEmail });
        global.logs.writelog(apiname_with_trace_id, ['Request : ', userEmail]);

        try {
            let whereObj: IWhereObject = {
                where: { user_email: userEmail }
            }

            if (additionalWhereParam !== null && typeof additionalWhereParam === 'object' && !Array.isArray(additionalWhereParam)) {
                whereObj = {
                    ...whereObj,
                    where: {
                        ...whereObj['where'],
                        ...additionalWhereParam
                    }
                };
            }

            const checkEmailExists: number = await this._authUserModel.countAllByAny(whereObj);
            global.logs.writelog(apiname_with_trace_id, ['checkEmailExists : ', checkEmailExists]);
            if (checkEmailExists) {
                return true;
            }
            return false;
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     *
     * @Developer: Sumit Sil
     * @Date: 20-03-2025
     * @Function: Generate Auth Code
     */
    generateAuthCode = async (loginObj: IGenerateAuthCodeReq): Promise<any> => {
        this.initLog()
        const apiname_with_trace_id: string = 'generateAuthCode - ' + global.Helpers.getTraceID(loginObj);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', loginObj]);
        try {
            if (loginObj.login_type == 2) { // FOR SOCIAL LOGIN
                let getUserDetailsBySocialId = await this._authUserModel.getUserDetailsBySocialId(loginObj.social_id);
                global.logs.writelog(apiname_with_trace_id, ['getUserDetailsBySocialId : ', getUserDetailsBySocialId]);

                if (getUserDetailsBySocialId && !getUserDetailsBySocialId.user_status) { // IF USER EXISTS WITH STATUS 0
                    return global.Helpers.makeBadServiceStatus('Inactive user.');
                } else {
                    let checkUserEmailExists = await this._authUserModel.countAllByAny({
                        where: {
                            user_email: loginObj.email,
                            user_status: {
                                [Op.ne]: 0 // 0 => EXCLUDE INACTIVE USER
                            }
                        }
                    });
                    global.logs.writelog(apiname_with_trace_id, ['checkUserEmailExists : ', checkUserEmailExists]);
                    if (checkUserEmailExists) { // IF USER EXISTS, THEN LOGIN
                        try {
                            const callAuthService: any = await this._grpcClient.loginMethodAsync(loginObj);
                            global.logs.writelog(apiname_with_trace_id, ['callAuthService : ', callAuthService]);
                            return callAuthService;
                        } catch (error: any) {
                            global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                            return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
                        }
                    } else { // IF USER NOT EXISTS, THEN REGISTER THE USER
                        let frontendUserRegistration: IfrontendUserRegistration = {
                            email: loginObj.email ? loginObj.email : null,
                            password: '',
                            is_verified: loginObj.email ? loginObj.email : 0,
                            is_social_reg: 1,
                            user_first_name: '',
                            gender: null,
                            country: '',
                            zipcode: '',
                            dob: '',
                            answers_data: [],
                            registration_status: 0,
                            social_id: loginObj.social_id,
                            social_token: loginObj.social_token,
                            social_type: loginObj.social_type
                        }
                        let userRegistration = await this.frontendUserRegistration(frontendUserRegistration);
                        if (userRegistration.success) {
                            /* CALL AUTH_SERVICE FOR AUTHORIZATION KEY -> FOR DIRECT LOGIN */
                            try {
                                const generateAuthCodeObj: IGenerateAuthCodeObj = {
                                    email: loginObj.email,
                                    device_os_type: loginObj.device_os_type,
                                    app_version: loginObj.app_version,
                                    device_uid: loginObj.device_uid,
                                    device_token: loginObj.device_token,
                                    device_name: loginObj.device_name,
                                    device_model: loginObj.device_model,
                                    device_version: loginObj.device_version,
                                    browser_id: loginObj.browser_id,
                                    browser_version: loginObj.browser_version,
                                    session_id: loginObj.session_id,
                                    browser_name: loginObj.browser_name,
                                    is_social_reg: 1,
                                    social_id: loginObj.social_id,
                                }

                                /* CALL THE MICRO SERVICE (AUTH SERVICE) WITH HELP OF GRPC */
                                let callAuthService: any = {};
                                try {
                                    callAuthService = await this._grpcClient.generateAuthCodeFromRegistrationMethodAsync(generateAuthCodeObj);
                                    global.logs.writelog(apiname_with_trace_id, ['callAuthService : ', callAuthService]);
                                    return callAuthService;
                                } catch (error: any) {
                                    global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                                    throw error;
                                }
                            } catch (error: any) {
                                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                                return global.Helpers.makeBadServiceStatus(error?.data?.response?.status?.msg);
                            }
                        }
                    }
                }
            } else {
                try {
                    const callAuthService: any = await this._grpcClient.loginMethodAsync(loginObj);
                    global.logs.writelog(apiname_with_trace_id, ['callAuthService : ', callAuthService]);
                    return callAuthService;
                } catch (error: any) {
                    global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                    return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
                }
            }
        } catch (err: any) {
            global.logs.writelog(apiname_with_trace_id, err.stack, 'ERROR');
            return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
        }
    }

    /*
     * @developer : Sumit Sil
     * @date : 20-03-2025
     * @description : Generate Token
     */
    async generateTokenService(param: IGenerateTokenReq) {
        this.initLog();
        const apiname_with_trace_id: string = "generateTokenService" + global.Helpers.getTraceID(param);
        global.logs.writelog(apiname_with_trace_id, ["Request : ", { param }]);
        try {
            let callAuthTokenService: any = {};
            try {
                callAuthTokenService = await this._grpcClient.generateTokenMethodAsync(param);
                global.logs.writelog(apiname_with_trace_id, ["callAuthTokenService : ", callAuthTokenService]);
            } catch (err: any) {
                global.logs.writelog(apiname_with_trace_id, err.stack, 'ERROR');
                return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
            }
            if (callAuthTokenService.status) {
                let authTokenServiceData = callAuthTokenService.data_sets;
                let responseObj = {
                    access_token: authTokenServiceData.access_token,
                    refresh_token: authTokenServiceData.refresh_token,
                    refresh_token_expire_timestamp: authTokenServiceData.refresh_token_expire_timestamp
                }
                return global.Helpers.makeSuccessServiceStatus('Logged in successfully!', responseObj);
            } else {
                return global.Helpers.makeBadServiceStatus(callAuthTokenService.status_message);
            }
        } catch (err: any) {
            global.logs.writelog(apiname_with_trace_id, err.stack, 'ERROR');
            return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
        }
    }

    /*
     * @developer : Sumit Sil
     * @date : 22-08-2024
     * @description : Regenerate Token
     */
    regeneratedTokenService = async (loginObj: IGenerateTokenReq): Promise<any> => {
        this.initLog()
        const apiname_with_trace_id: string = 'regeneratedTokenService - ' + global.Helpers.getTraceID(loginObj);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', loginObj]);
        try {
            try {
                const callAuthService: any = await this._grpcClient.regenerateTokenMethodAsync(loginObj);
                global.logs.writelog(apiname_with_trace_id, ['callAuthService : ', callAuthService]);
                return callAuthService;
            } catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
            }
        } catch (e: any) {
            global.logs.writelog(apiname_with_trace_id, e.stack, 'ERROR');
            return global.Helpers.makeBadServiceStatus('Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: User Registration
    */
    userRegistration = async (reqData: IUserRegistration) => {
        this.initLog();
        const apiname_with_trace_id: string = 'userRegistration - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* FUNCTION CALL TO CHECK ID EMAIL IS EXISTS IN "AUTH_USERS" TBALE. IF EXISTS THEN THIS FUNCTION WILL RETURN TRUE AS BOOLEAN VALUE */
            const checkEmailExists: boolean = await this.userEmailExistenceChecking(reqData.email);
            global.logs.writelog(apiname_with_trace_id, ['checkEmailExists : ', checkEmailExists]);
            if (checkEmailExists) {
                return global.Helpers.makeBadServiceStatus('email_exists');
            }

            reqData.registration_status = reqData.is_verified == 1 ? 3 : 2;
            let userRegistration: any = await this.frontendUserRegistration(reqData);
            global.logs.writelog(apiname_with_trace_id, ['userRegistration : ', userRegistration]);

            if (!userRegistration.success) {
                return global.Helpers.makeBadServiceStatus('User registration failed!');
            }

            /* CALL AUTH_SERVICE FOR AUTHORIZATION KEY -> FOR DIRECT LOGIN */
            try {
                const generateAuthCodeObj: IGenerateAuthCodeObj = {
                    email: reqData.email,
                    device_os_type: reqData.device_os_type,
                    app_version: reqData.app_version,
                    device_uid: reqData.device_uid,
                    device_token: reqData.device_token,
                    device_name: reqData.device_name,
                    device_model: reqData.device_model,
                    device_version: reqData.device_version,
                    browser_id: reqData.browser_id,
                    browser_version: reqData.browser_version,
                    session_id: reqData.session_id,
                    browser_name: reqData.browser_name,
                    is_social_reg: reqData.is_social_reg,
                    social_id: reqData.social_id
                }

                /* CALL THE MICRO SERVICE (AUTH SERVICE) WITH HELP OF GRPC */
                let callAuthService: any = {};
                try {
                    callAuthService = await this._grpcClient.generateAuthCodeFromRegistrationMethodAsync(generateAuthCodeObj);
                    global.logs.writelog(apiname_with_trace_id, ['callAuthService : ', callAuthService]);
                } catch (error: any) {
                    global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                    throw error;
                }

                return global.Helpers.makeSuccessServiceStatus('User registered successfully', callAuthService.data_sets);
            } catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                return global.Helpers.makeBadServiceStatus(error?.data?.response?.status?.msg);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ['ERROR:', error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Function for Fronte-End User Registration
    */
    frontendUserRegistration = async (reqData: IfrontendUserRegistration) => {
        this.initLog();
        const apiname_with_trace_id: string = 'frontendUserRegistration - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /*GENERATING UNIQUE ID*/
            let uniqueId: any = global.Helpers.generateMongooseShortId();

            /* INSERT INTO AUTH_USERS TABLE */
            const insertAuthUserData: any = await this._authUserModel.addNewRecord({
                unique_id: uniqueId,
                user_email: reqData.email,
                user_type: 2,
                user_pwd: reqData.is_social_reg == 1 ? null : await global.Helpers.hashPassword(reqData.password),
                user_status: 2, // 2 => INITIALLY THE USER STATUS IS 2 => PROFILE STATUS IN-PROGRESS
                registration_status: reqData.registration_status
            });
            global.logs.writelog(apiname_with_trace_id, ['insertAuthUserData : ', insertAuthUserData]);

            /* CREATE PROMISES ARRAY */
            const promises: Promise<any>[] = [];

            /* INSERT DATA INTO USERS PROFILE TABLE */
            promises.push(this._userProfileBasicsModel.addNewRecord({
                user_id: insertAuthUserData.auth_user_id,
                unique_id: uniqueId,
                user_first_name: reqData.user_first_name,
                user_phone_number: "",
                user_gender: reqData.gender,
                user_country: reqData.country,
                user_city: "",
                user_zip: reqData.zipcode,
                user_dob: reqData.dob,
                user_age: reqData.dob ? global.Helpers.calculateAge(reqData.dob) : "",
                user_region: "",
                ques_submit_status: 0,
                introduction: {
                    en: "",
                    zh: ""
                },
                university: "",
                political_view: ""
            }));

            /* MODIFYING USER ANSWER DATA FOR USERS ANSWER TABLE */
            if (Array.isArray(reqData.answers_data) && reqData.answers_data.length > 0) {
                const updatedData = reqData.answers_data.map((item: any) => ({
                    user_id: insertAuthUserData.auth_user_id,
                    ...item
                }));
                promises.push(this._userAnswersModel.bulkInsert(updatedData));
            }

            /* CONDITIONAL: INSERT DATA INTO AUTH_USER_SOCIAL_LOGINS */
            if (reqData.is_social_reg == 1) {
                promises.push(this._authUserSocialLoginModel.addNewRecord({
                    fk_auth_user_id: insertAuthUserData.auth_user_id,
                    social_id: reqData.social_id,
                    social_token: reqData.social_token,
                    social_type: reqData.social_type
                }));
            }

            /* EXECUTE ALL PROMISES */
            const [insertUserData, insertAnswerData, insertSocialLoginData] = await Promise.all(promises);

            global.logs.writelog(apiname_with_trace_id, ['insertUserData : ', insertUserData]);
            global.logs.writelog(apiname_with_trace_id, ['insertAnswerData : ', insertAnswerData]);
            if (reqData.is_social_reg == 1) {
                global.logs.writelog(apiname_with_trace_id, ['insertSocialLoginData : ', insertSocialLoginData]);
            }

            return {
                success: true,
                auth_user_id: insertAuthUserData.auth_user_id
            };
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ['ERROR:', error.stack]);
            throw new Error(error);
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Function for Admin Registration
    */
    adminRegistration = async (reqData: IUserRegistration) => {
        this.initLog();
        const apiname_with_trace_id: string = 'adminRegistration - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* INSERT INTO AUTH_USERS TABLE */
            const insertAuthUserData: any = await this._authUserModel.addNewRecord({
                user_email: reqData.email,
                user_type: 1,
                user_pwd: reqData.is_social_reg == 1 ? null : await global.Helpers.hashPassword(reqData.password),
                user_status: reqData.is_verified == 1 ? 1 : 2
            });
            global.logs.writelog(apiname_with_trace_id, ['insertAuthUserData : ', insertAuthUserData]);

            /* INSERT DATA INTO USERS TABLE */
            /* const insertUserData: any = await this._userDetailsModel.addNewRecord({
                fk_auth_user_id: insertAuthUserData.auth_user_id,
                user_email: reqData.email,
                user_first_name: reqData.user_first_name,
                phone_number: reqData.phone_number,
                gender: reqData.gender,
                country: reqData.country,
                city: reqData.city,
                dob: reqData.dob,
                age: global.Helpers.calculateAge(reqData.dob),
                height: reqData.height
            });
            global.logs.writelog(apiname_with_trace_id, ['insertUserData : ', insertUserData]); */

            return {
                success: true,
                auth_user_id: insertAuthUserData.auth_user_id
            };
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ['ERROR:', error.stack]);
            throw new Error(error);
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Function for create token using JWT
    */
    async createToken(param: any) {
        /* CALL THE JWT CREATE TOKEN HELPER */
        try {
            const generateToken: any | unknown = await this._jwtHelper.createToken({ param });
            return (generateToken);
        } catch (error: any) {
            return error;
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Verify OTP
    */
    verifyOtp = async (reqData: IVerifyOtp): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'verifyOtp - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* CHECK EMAIL IS EXISTS IN "AUTH_USERS" TABLE AND FETCH USER_TYPE WHERE USER_STATUS NOT EQUAL-TO 0 => INACTIVE  */
            const checkEmailExists: any = await this._authUserModel.findByAnyOne({
                attributes: ['user_type', 'user_status', 'registration_status', 'user_email'],
                where: {
                    user_email: reqData.email,
                    user_status: {
                        [Op.ne]: 0 // 0 => EXCLUDE THOSE WHOS ARE IN INACTIVE STATE 
                    }
                }
            });
            global.logs.writelog(apiname_with_trace_id, ['checkEmailExists : ', checkEmailExists]);

            if (!checkEmailExists) {
                return global.Helpers.makeBadServiceStatus('email_not_found');
            }

            /* CHECK FOR OTP EXISTS IN "USER_OTP" TABLE AND FETCH CREATED_AT TIME TO CALCULATE OTP HAS EXPIRED OR NOT */
            const checkForOtpExists: any = await this._userOtpModel.findByAnyOne({
                attributes: ['user_otp_id', 'created_at', 'updated_at'],
                where: { user_email: reqData.email, otp_purpose: reqData.otp_for, otp: reqData.otp }
            })
            global.logs.writelog(apiname_with_trace_id, ['checkForOtpExists : ', checkForOtpExists]);

            if (checkForOtpExists == null) {
                return global.Helpers.makeBadServiceStatus('invalid_otp');
            }

            /* CHECK OTP HAS EXPIRED OR NOT - GET CALCULATED DIFFERENCE IN SECONDS */
            const diffInSeconds = global.Helpers.getTimeDiffenceWithTargetTime(checkForOtpExists.updated_at == null ? checkForOtpExists.created_at : checkForOtpExists.updated_at);

            /* CHECK TIME IS GREATER THAN THE MENTIONED TIME IN ENV */
            if (diffInSeconds > (Number(process.env.otp_exp_time_in_seconds) || 300)) {
                return global.Helpers.makeBadServiceStatus('otp_expired');
            }

            if (reqData.otp_for == 1) {
                if (checkEmailExists.user_status == 2) {
                    let updateUserStatus: any = await this._authUserModel.updateAnyRecord({ registration_status: 3 }, { where: { user_email: checkEmailExists.user_email } });
                    global.logs.writelog(apiname_with_trace_id, ['updateUserStatus: ', updateUserStatus]);
                }
            }
            if (checkForOtpExists) {
                let deleteOtp: any = await this._userOtpModel.deleteByAny({ otp: reqData.otp });
                global.logs.writelog(apiname_with_trace_id, ['deleteOtp: ', deleteOtp]);
            }
            return global.Helpers.makeSuccessServiceStatus("OTP verified successfully.", {});
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Send OTP
    */
    sendOtp = async (reqData: ISendOtp): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'sendOtp - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* CHECK FOR EMAIL EXISTS IN AUTH_USERS TABLE */
            const checkEmailExists: any = await this._authUserModel.fetchUserDetailsByEmail(reqData.email);
            global.logs.writelog(apiname_with_trace_id, ['checkEmailExists : ', checkEmailExists]);

            if (!checkEmailExists) {
                return global.Helpers.makeBadServiceStatus('User not found.');
            }
            /* THIS WILL CHECK IF THE OTP RESENT COUNT IS GREATER THAN 3 OR NOT */
            let otpResentCount: any = await this._userOpTrailsModel.countAllByAny({
                where: {
                    user_email: reqData.email,
                    user_type: checkEmailExists.user_type,
                    otp_purpose: reqData.otp_for,
                    created_at: {
                        [Op.gte]: global.Helpers.checkOtpTime(),
                    },
                }
            });
            global.logs.writelog(apiname_with_trace_id, ['otpResentCount : ', otpResentCount]);

            if (otpResentCount >= Number(USER_CONFIGS.MAX_OTP_LIMIT)) {
                return global.Helpers.makeBadServiceStatus('otp_quota_exceeded');
            }

            if (reqData.otp_for == 2) { // FORGOT PASSWORD
                /* CHECK GIVEN EMAIL IS REGISTERED WITH "SOCIAL LOGIN" PREVIOUSLY OR NOT. IF SOCIAL LOGIN THEN RESTRICT ACCESS FOR FORGOT PASSWORD SECTION */
                const checkEmailIsSocial: any = await this._authUserSocialLoginModel.findByAnyOne({
                    attributes: ['social_type'],
                    where: { fk_auth_user_id: checkEmailExists.auth_user_id }
                });
                global.logs.writelog(apiname_with_trace_id, ['checkEmailIsSocial : ', checkEmailIsSocial]);

                if (checkEmailIsSocial != null) {
                    return global.Helpers.makeBadServiceStatus(`You're registered with your ${checkEmailIsSocial.social_type == 1 ? "Google" : "Apple"} acccount. Please use the ${checkEmailIsSocial.social_type == 1 ? "Google" : "Apple"} login button to access your account.`);
                }
            }

            /* GENERATE A RANDOM FOUR DIGIT CODE FOR REGISTRATION VERIFICATION OTP */
            const randomSixDigitOtp: string = global.Helpers.generateRandomNumberByLength(6);

            /* DEFINING MAIL SUBJECT AND HEADING DYNAMICALLY BY VERIFICATION TYPE */
            const mailSubject: string = reqData.otp_for == 1 ? "OTP For Verification" : "OTP For Forgot Password";
            const mailHeading: string = reqData.otp_for == 1 ? "Registered Successfully" : "Forgot Password Verification Mail";

            let findUserInMongoDb: any = await this._userProfileBasicsModel.findOne({ user_id: Number(checkEmailExists.auth_user_id) }, { user_first_name: 1 });
            global.logs.writelog(apiname_with_trace_id, ['findUserInMongoDb: ', findUserInMongoDb]);

            /* OTP - MAIL SEND THROUGH SMTP */
            try {
                let emailObj = {
                    name: findUserInMongoDb.user_first_name || '',
                    email: reqData.email,
                    ejs_path: 'otp.ejs',
                    logo: process.env.MATCH_BY_AI_LOGO_PATH,
                    otp: randomSixDigitOtp,
                    mailHeading: mailHeading
                };
                let MailData = {
                    to: reqData.email,
                    from: "",
                    subject: mailSubject,
                    reply_to: "",
                    emailbody: emailObj
                }

                let apiRoute = 'mailSend';
                global.Helpers.callSendMailMicroServices(MailData, apiRoute);
            } catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
            }

            /* CHECK OTP ALREADY EXISTS OR NOT, IF EXISTS THEN UPDATE THE OTP ELSE INSERT A NEW OTP WITH DETAILS */
            const checkOtp: number = await this._userOtpModel.countAllByAny({
                where: {
                    user_email: reqData.email,
                    otp_purpose: reqData.otp_for
                }
            });
            global.logs.writelog(apiname_with_trace_id, ['checkOtp : ', checkOtp]);

            if (checkOtp) {
                /* UPDATE THE OTP INTO "USER_OTP" TABLE */
                const updateOtp: any = await this._userOtpModel.updateAnyRecord({
                    otp: randomSixDigitOtp
                }, { where: { user_email: reqData.email, otp_purpose: reqData.otp_for } });
                global.logs.writelog(apiname_with_trace_id, ['updateOtp : ', updateOtp]);
            } else {
                /* INSERT THE OTP INTO "USER_OTP" TABLE */
                const insertOtp: any = await this._userOtpModel.addNewRecord({
                    user_email: reqData.email,
                    user_type: checkEmailExists.user_type,
                    otp: randomSixDigitOtp,
                    otp_purpose: reqData.otp_for
                });
                global.logs.writelog(apiname_with_trace_id, ['insertOtp : ', insertOtp]);
            }
            /* IF IS_RESEND IS 1 */
            if (reqData.is_resend == 1) {
                /* INSERT THE OTP INTO "USER_OTP_TRAILS" TABLE */
                const insertOtpIntoUserTrails: any = await this._userOpTrailsModel.addNewRecord({
                    user_email: reqData.email,
                    user_type: checkEmailExists.user_type,
                    otp_purpose: reqData.otp_for
                });
                global.logs.writelog(apiname_with_trace_id, ['insertOtpIntoUserTrails : ', insertOtpIntoUserTrails]);
            }

            return global.Helpers.makeSuccessServiceStatus("A verification code has been sent successfully to your email address.", {});
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Forgot Password
    */
    forgotPassword = async (reqData: IForgotPasswordReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'forgotPassword - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* FUNCTION CALL TO CHECK ID EMAIL IS EXISTS IN "USERS" TBALE. IF EXISTS THEN THIS FUNCTION WILL RETURN TRUE AS BOOLEAN VALUE */
            const checkEmailExists: boolean = await this.userEmailExistenceChecking(reqData.email);
            global.logs.writelog(apiname_with_trace_id, ['checkEmailExists : ', checkEmailExists]);
            if (!checkEmailExists) {
                return global.Helpers.makeBadServiceStatus('email_not_found');
            }

            /* CHECK OTP IS EXISTS IN "USER_OTP" TABLE, IF NOT EXISTS THROW ERROR */
            const checkForOtpExists: any = await this._userOtpModel.findByAnyOne({
                attributes: ['user_otp_id', 'created_at'],
                where: { user_email: reqData.email, otp_purpose: 2, otp: reqData.otp }
            })
            global.logs.writelog(apiname_with_trace_id, ['checkForOtpExists : ', checkForOtpExists]);

            if (checkForOtpExists == null) {
                return global.Helpers.makeBadServiceStatus('Invalid OTP.');
            }

            /* UPDATE PASSWORD IN "USERS" TABLE */
            const updateObj: { user_pwd: string } = {
                user_pwd: await global.Helpers.hashPassword(reqData.new_password)
            };
            const updatePassword: any = await this._authUserModel.updateAnyRecord(updateObj, { where: { user_email: reqData.email } });
            global.logs.writelog(apiname_with_trace_id, ['updatePassword : ', updatePassword]);

            /* DELETE THE OTP FROM TABLE WHERE OTP_PURPOSE = 2 (2 => FORGOT PASSWORD) */
            const deleteOtp: any = await this._userOtpModel.deleteByAny({ user_email: reqData.email, otp: reqData.otp, otp_purpose: 2 });
            global.logs.writelog(apiname_with_trace_id, ['deleteOtp : ', deleteOtp]);

            return global.Helpers.makeSuccessServiceStatus("Password reset successfully.", {});
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Change Password
    */
    changePassword = async (reqData: IChangePasswordReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'changePassword - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* CHECK FOR EMAIL EXISTS AND FETCH USER PASSWORD VALIDATE. IF NOT VALID THROW ERROR */
            const checkUser: any = await this._authUserModel.findByAnyOne({
                attributes: ['user_pwd'],
                where: {
                    auth_user_id: userId
                }
            });
            global.logs.writelog(apiname_with_trace_id, ['checkUser : ', checkUser]);
            if (!checkUser) {
                return global.Helpers.makeBadServiceStatus('User not found.');
            }

            /* COMPARE PASSWORD WITH THE OLD PASSWORD AND OLD DB PASSWORD. IF NOT MATCHED THEN THROW ERROR */
            const comparePassword = await global.Helpers.comparePassword(reqData.old_password, checkUser.user_pwd)

            if (!comparePassword) {
                return global.Helpers.makeBadServiceStatus('Current Password does not match.');
            }

            /* UPDATE PASSWORD IN "AUTH_USERS" TABLE */
            const updateObj = {
                user_pwd: await global.Helpers.hashPassword(reqData.new_password)
            };
            const updatePassword: any = await this._authUserModel.updateAnyRecord(updateObj, {
                where: { auth_user_id: userId }
            });
            global.logs.writelog(apiname_with_trace_id, ['updatePassword : ', updatePassword]);

            return global.Helpers.makeSuccessServiceStatus("Password updated Successfully.", {});

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Update User Profile
    */
    updateUserProfile = async (reqData: IUpdateUserProfileReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'updateUserProfile - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* CHECK FOR VALID USER BY ID IF NOT VALID THROW AN ERROR */
            let getUserInfo: any = await this._authUserModel.findByAnyOne({
                attributes: ['user_email', 'user_pwd', 'user_status', 'registration_status'],
                where: { auth_user_id: userId }
            });
            getUserInfo = JSON.parse(JSON.stringify(getUserInfo));
            global.logs.writelog(apiname_with_trace_id, ['getUserInfo : ', getUserInfo]);

            if (!getUserInfo) {
                return global.Helpers.makeBadServiceStatus('User not found.');
            }

            /* PREPARE UPDATE OBJ FOR USER DETAILS */
            const updateObj: any = {};

            if (reqData.new_password) {
                const hashPass: string = getUserInfo.user_pwd; // PASSWORD FROM DB

                if (hashPass != null) {
                    /* CHECK PASSWORD FROM REQUEST WITH HASH PASSWORD FROM DB, IF NOT MATCHED THEN THROW ERROR */
                    const comparePassword: boolean = await global.Helpers.comparePassword(reqData.current_password, hashPass);
                    if (!comparePassword) {
                        return global.Helpers.makeBadServiceStatus("Invalid password entered.");
                    }
                }
                let new_hash_password = await global.Helpers.hashPassword(reqData.new_password);
                // UPDATE THE NEW PASSWORD IN AUTH USERS TABLE
                let updatePassword = await this._authUserModel.updateAnyRecord({
                    user_pwd: new_hash_password
                }, {
                    where: {
                        auth_user_id: userId
                    }
                });
                global.logs.writelog(apiname_with_trace_id, ["updatePassword:", updatePassword]);
            }

            // CHECK EACH FIELD AND ADD IT TO THE UPDATE OBJECT IF IT'S PROVIDED
            if (reqData.user_first_name) {
                updateObj.user_first_name = reqData.user_first_name;
            }
            if (reqData.phone_number) {
                updateObj.user_phone_number = reqData.phone_number;
            }
            if ([0, 1, 2].includes(reqData.gender)) {
                updateObj.user_gender = reqData.gender;
            }
            if (reqData.country) {
                updateObj.user_country = reqData.country;
            }
            if (reqData.city) {
                updateObj.user_city = reqData.city;
            }
            if (reqData.dob) {
                updateObj.user_dob = reqData.dob;
                updateObj.user_age = global.Helpers.calculateAge(reqData.dob);
            }
            if (reqData.height) {
                updateObj.user_height = reqData.height
            }
            if (reqData.introduction) {
                updateObj.introduction = {};
                updateObj.introduction.en = reqData.introduction;
                updateObj.introduction.zh = "";
            }
            if (reqData.university) {
                updateObj.university = reqData.university;
            }
            if (reqData.political_view) {
                updateObj.political_view = reqData.political_view;
            }
            if(reqData.zipcode) {
                updateObj.user_zip = reqData.zipcode;
            }

            if (getUserInfo.user_status == 2 && getUserInfo.registration_status == 1) {
                // IF EMAIL ID IS NOT THERE IN DB, THEN UPDATE THE EMAIL FROM REQ BODY
                // THEN UPDATE THE REGISTRATION STATUS TO 2 => BASIC PROFILE DETAILS UPDATED
                if (getUserInfo.user_email == null || getUserInfo.user_email == '') {
                    if (reqData.email) {
                        let updateEmail = await this._authUserModel.updateAnyRecord({
                            user_email: reqData.email,
                            registration_status: 2
                        }, {
                            where: {
                                auth_user_id: userId
                            }
                        });
                        global.logs.writelog(apiname_with_trace_id, ["updateEmail : ", updateEmail]);
                    }
                }
            }

            /* UPDATE THE USER DETAILS */
            const updateUserProfile: any = await this._userProfileBasicsModel.update({ user_id: userId }, { $set: updateObj });
            global.logs.writelog(apiname_with_trace_id, ["updateUserProfile : ", updateUserProfile]);

            // IF INTRODUCTION IS ADDED THEN UPDATE THE STATUS
            if (reqData.introduction && getUserInfo.registration_status == 5) {
                let updateEmail = await this._authUserModel.updateAnyRecord({
                    user_status: 3,
                    registration_status: 6
                }, {
                    where: {
                        auth_user_id: userId
                    }
                });
                global.logs.writelog(apiname_with_trace_id, ["updateEmail : ", updateEmail]);
            }
            return global.Helpers.makeSuccessServiceStatus("Your profile information has been updated successfully.", {});

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Check social login ID exists or not
    */
    checkSocialLoginExists = async (reqData: ICheckSocialLoginExists): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'checkSocialLoginExists - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* Check for social login exists or not */
            const hasSocialLogin: any = await this._authUserSocialLoginModel.countAllByAny({
                where: { social_id: reqData.social_id }
            });
            global.logs.writelog(apiname_with_trace_id, ['hasSocialLogin : ', hasSocialLogin]);

            if (hasSocialLogin) {
                return global.Helpers.makeBadServiceStatus('Account already exists.');
            }

            return global.Helpers.makeSuccessServiceStatus("No social login found.", {});

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Fetch all notification list by user
    */
    allNotificationsList = async (reqData: IAllNotificationsListReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'allNotificationsList - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* Check for valid user id */
            const checkValidUser: number = await this._authUserModel.countAllByAny({ where: { auth_user_id: userId } });
            global.logs.writelog(apiname_with_trace_id, ["checkValidUser : ", checkValidUser])

            if (!checkValidUser) {
                return global.Helpers.makeBadServiceStatus('Invalid user.')
            }

            const limit: number = reqData.rec_per_page;
            const offset: number = limit * (Number(reqData.page_no) - 1);

            /* Fetch all notification list */
            const notificationList: any = await this._userPushNotificationModel.findAndCountAll({
                attributes: [['notification_id', 'id'], 'message', 'read_status', 'created_at'],
                where: { fk_auth_user_id: userId },
                offset: offset,
                limit: limit,
                order: [['notification_id', 'DESC']],
                raw: true
            });
            global.logs.writelog(apiname_with_trace_id, ["notificationList : ", notificationList])

            let encryptedRows = [];
            if (notificationList.rows.length > 0) {
                encryptedRows = notificationList.rows.map((row: any) => ({
                    ...row,
                    id: global.encrypt_decrypt_helper.encryptResponse(JSON.stringify(row.id)),
                    created_at: global.Helpers.getDateTimeOnlyWithFormat(row.created_at, "h.mmA DD-MMM-YYYY") // FUNCTION CALL TO FORMAT THE DATE IN REQUIRED FORMAT
                }));
            }

            /* Make all notifications readed after calling this list API */
            const makeAllNotificationStatusRead: any = await this._userPushNotificationModel.updateAnyRecord({
                read_status: 1
            }, { where: { fk_auth_user_id: userId } });
            global.logs.writelog(apiname_with_trace_id, ["makeAllNotificationStatusRead : ", makeAllNotificationStatusRead])

            return global.Helpers.makeSuccessServiceStatus("Data fetched successfully.", { notification_list: encryptedRows, total_count: notificationList.count });

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Get unread notifications count
    */
    unreadNotificationCount = async (reqData: IUnreadNotificationCountReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'unreadNotificationCount - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* Check for valid user id */
            const checkValidUser: number = await this._authUserModel.countAllByAny({ where: { auth_user_id: userId } });
            global.logs.writelog(apiname_with_trace_id, ["checkValidUser : ", checkValidUser])

            if (!checkValidUser) {
                return global.Helpers.makeBadServiceStatus('Invalid user.')
            }

            /* Fetch all unread notifications count */
            const unreadNotificationCount: number = await this._userPushNotificationModel.countAllByAny({
                where: { fk_auth_user_id: userId, read_status: 0 }
            });
            global.logs.writelog(apiname_with_trace_id, ["unreadNotificationCount : ", unreadNotificationCount])

            return global.Helpers.makeSuccessServiceStatus("Count fetched successfully.", { unread_notification_count: unreadNotificationCount });

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Common function to save user notifications
    */
    saveUserNotifications = async (notificationFromId: number, projectId: number, action: string, reviewStatus: number, notificationFor: number, memberId?: number): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'saveUserNotifications - ' + global.Helpers.getTraceID({ notificationFromId, projectId });
        global.logs.writelog(apiname_with_trace_id, ['Request : ', { notificationFromId, projectId }]);

        try {
            let notificationMessageBody: any = {}

            /* CHECK THE LOGGED IN USER IS TEAM MEMBER OR NOT IF NOT TEAM MEMBER THEN THROW ERROR */
            const userDetails: any = await this._authUserModel.fetchUserDetailsByAuthUserId(notificationFromId)
            global.logs.writelog(apiname_with_trace_id, ["userDetails : ", userDetails])

            let title_msg: string = "";
            let notification_msg: string = "";
            let fetchUserDetailsWithLoginData: any;

            if (notificationFor == 2) { // FOR TEAM LEAD
                /* Get the team lead by project id */
                // fetchUserDetailsWithLoginData = await this._companyProjectsModel.fetchTeamLeadDetailsWithLoginDataByProjectId(projectId);
                // global.logs.writelog(apiname_with_trace_id, ['fetchUserDetailsWithLoginData : ', fetchUserDetailsWithLoginData])

                if (action == "ASSMNT") {
                    title_msg = "Self sssessment submitted";
                    notification_msg = `${userDetails.user_first_name} submitted his/her self assessment report for the project - ${fetchUserDetailsWithLoginData.project_name}`;
                }

                notificationMessageBody = {
                    notification_for: 2,
                    project_id: global.encrypt_decrypt_helper.encryptResponse(String(projectId)),
                    member_id: global.encrypt_decrypt_helper.encryptResponse(String(notificationFromId))
                }
            } else if (notificationFor == 3) { // FOR TEAM MEMBER
                /* Get the team lead by project id */
                // fetchUserDetailsWithLoginData = await this._projectMembersModel.fetchTeamMemberDetailsWithLoginDataByProjectId(projectId, memberId);
                // global.logs.writelog(apiname_with_trace_id, ['fetchUserDetailsWithLoginData : ', fetchUserDetailsWithLoginData])

                if (action == "ASSMNT") {
                    if (reviewStatus == 1) { // Accepted
                        title_msg = "Self assessment accepted";
                        notification_msg = `${userDetails.user_first_name} accepted your self assessment report for the project - ${fetchUserDetailsWithLoginData.project_name}`;
                    } else if (reviewStatus == 2) { // Rejected
                        title_msg = "Self assessment rejected";
                        notification_msg = `${userDetails.user_first_name} rejected your self assessment report for the project - ${fetchUserDetailsWithLoginData.project_name}`;
                    } else if (reviewStatus == 3) { // Accepted with minor changes
                        title_msg = "Self assessment accepted";
                        notification_msg = `${userDetails.user_first_name} accepted your self assessment report with some minor changes for the project - ${fetchUserDetailsWithLoginData.project_name}`;
                    }
                }

                notificationMessageBody = {
                    notification_for: 3,
                    project_id: global.encrypt_decrypt_helper.encryptResponse(String(projectId)),
                }
            }

            /* Fetch all logged in device tokens by fk_auth_user_id from auth_user_login table */
            const deviceTokens: any = await this._authUserLoginModel.findAllByAny({
                attributes: ['device_token'],
                where: { fk_auth_user_id: fetchUserDetailsWithLoginData.fk_auth_user_id, is_logged_in: 1 },
                raw: true
            });
            global.logs.writelog(apiname_with_trace_id, ['deviceTokens : ', deviceTokens])

            /* Send push notification */
            if (deviceTokens.length > 0) {
                for (let value of deviceTokens) {
                    try {
                        const message = {
                            notification: {
                                title: title_msg,
                                body: notification_msg
                            },
                            data: {
                                messageBody: JSON.stringify(notificationMessageBody)
                            },
                            token: value.device_token
                        }

                        /* admin.messaging().send(message)
                            .then((response: any) => {
                                global.logs.writelog(apiname_with_trace_id, ["PUSH NOTOFICATION RESPONSE:", response]);
                            })
                            .catch((error: any) => {
                                global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
                            }); */
                    } catch (error: any) {
                        global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
                    }
                }
            }

            try {
                /* Insert into user_push_notication table */
                const saveNotifications: any = await this._userPushNotificationModel.addNewRecord({ fk_auth_user_id: fetchUserDetailsWithLoginData.fk_auth_user_id, action_id: "ASSMNT", device_uid: fetchUserDetailsWithLoginData.device_uid, message: notification_msg, send_to_device_type: fetchUserDetailsWithLoginData.device_os });
                global.logs.writelog(apiname_with_trace_id, ['saveNotifications : ', saveNotifications])
            } catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            }

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Get unread notifications count
    */
    logout = async (reqData: ILogoutReq): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id: string = 'logout - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);

        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* Check for valid user id */
            const checkValidUser: any = await this._authUserModel.checkForValidLoggedInUserByDeviceId(userId, reqData.device_uid);
            global.logs.writelog(apiname_with_trace_id, ["checkValidUser : ", checkValidUser])


            if (!checkValidUser) {
                return global.Helpers.makeBadServiceStatus('Invalid user.')
            }

            if (checkValidUser.device_os == 1 || checkValidUser.device_os == 2) { // Only for Android and Ios
                /* Update the is_logged_in field in auth_user_login table */
                const updateLoginStatus: any = await this._authUserLoginModel.updateAnyRecord({
                    is_logged_in: 0
                }, { where: { fk_auth_user_id: userId, device_uid: reqData.device_uid } });
                global.logs.writelog(apiname_with_trace_id, ["updateLoginStatus:", updateLoginStatus]);
            }

            return global.Helpers.makeSuccessServiceStatus("User logged-out successfully.", {});

        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }
    /**
     * @Developer: Chumki Chakraborty
     * @Date: 31-03-2025
     * @Function: get Categories
    */
    getCategories = async () => {
        this.initLog();
        const apiname_with_trace_id: string = 'getCategories - ' + global.Helpers.getTraceID({});
        global.logs.writelog(apiname_with_trace_id, ['Request : ', {}]);
        try {
            /* FETCH CATAGORY WISE DATA */
            let categoriesList: any = await this._masterProfileQuestion.findAggregate([
                {
                    $project: {
                        _id: 0,
                        questionnaire_type_id: 1,
                        questionnaire_type: 1,
                    }
                },
                {
                    $sort: {
                        questionnaire_type_id: 1
                    }
                }
            ]);
            global.logs.writelog(apiname_with_trace_id, ["categoriesList : ", categoriesList])
            return global.Helpers.makeSuccessServiceStatus("categories list fetched successfully.", { categoriesList });
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 31-03-2025
     * @Function: Save Answer
    */
    saveAnswer = async (reqData: IAnswerSave): Promise<any> => {
        this.initLog();
        const apiname_with_trace_id = `saveAnswer - ${global.Helpers.getTraceID(reqData)}`;
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            let initialAnswersActivity: number = 0;
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            const checkUserExistsInAnswersCollection: any = await this._userAnswersModel.findAll({ user_id: userId }, { user_id: 1, _id: 0 });
            global.logs.writelog(apiname_with_trace_id, ["checkUserExistsInAnswersCollection:", checkUserExistsInAnswersCollection]);

            const mainAnswerSave: ImainAnswerSave[] = reqData.answers_data.map(section => ({
                user_id: userId,
                questionnaire_id: section.questionnaire_id,
                answers: section.answers.map(answer => ({
                    q_id: answer.q_id,
                    sel_opt_id: answer.sel_opt_id,
                    sel_opt_text: answer.sel_opt_text
                }))
            }));
            if (checkUserExistsInAnswersCollection.length === 0) {/*IF USER ID DOES NOT EXISTS,IT WILL INSERT NEW DATA */
                // INSERT ALL NEW ANSWERS FOR A NEW USER
                const insertAnswerData = await this._userAnswersModel.bulkInsert(mainAnswerSave);
                global.logs.writelog(apiname_with_trace_id, ['insertAnswerData : ', insertAnswerData]);

                let updateRegistrationStatus = await this._authUserModel.updateAnyRecord({
                    registration_status: 1
                }, {
                    where: {
                        auth_user_id: userId
                    }
                });
                global.logs.writelog(apiname_with_trace_id, ['updateRegistrationStatus : ', updateRegistrationStatus]);
            } else {
                /*IF USER ID EXISTS,IT WILL LOOK FOR QUESTIONAIRE ID */
                let newAnswers: any[] = [];
                for (const elements of mainAnswerSave) {
                    const checkQuestionIds = await this._userAnswersModel.findAll(
                        { user_id: userId, questionnaire_id: elements.questionnaire_id }
                    );

                    if (checkQuestionIds.length === 0) { /*IF QUESTIONNAIRE ID NOT FOUND,IT WILL INSERT NEW QUESTIONAIRE ID*/
                        newAnswers.push(elements);
                        continue;
                    }

                    for (const ans of elements.answers) {
                        const checkQIds = await this._userAnswersModel.findAll(
                            { user_id: userId, questionnaire_id: elements.questionnaire_id, "answers.q_id": ans.q_id }
                        );

                        if (checkQIds.length > 0) { /*IF Q ID FOUND,IT WILL INSERT NEW SEL OPT IDS*/
                            // UPDATE EXISTING ANSWER
                            await this._userAnswersModel.update(
                                {
                                    user_id: userId,
                                    questionnaire_id: elements.questionnaire_id,
                                    "answers.q_id": ans.q_id
                                },
                                {
                                    $set: {
                                        "answers.$.sel_opt_id": ans.sel_opt_id,
                                        "answers.$.sel_opt_text": ans.sel_opt_text || ""
                                    }
                                }
                            );
                        } else { /*ELSE NEW Q ID WILL BE INSERTED*/
                            // INSERT NEW QUESTION ID
                            await this._userAnswersModel.update(
                                { user_id: userId, questionnaire_id: elements.questionnaire_id },
                                { $addToSet: { answers: [{ q_id: ans.q_id, sel_opt_id: ans.sel_opt_id, sel_opt_text: ans.sel_opt_text || "" }] } }
                            );
                        }
                    }
                }

                if (newAnswers.length > 0) {
                    const insertQuestionData = await this._userAnswersModel.bulkInsert(newAnswers);
                    global.logs.writelog(apiname_with_trace_id, ['insertQuestionData : ', insertQuestionData]);
                }
            }

            const getLastQuestionnaireId = await this._userAnswersModel.getLastQuestionnaireId(userId);
            global.logs.writelog(apiname_with_trace_id, ['getLastQuestionnaireId : ', getLastQuestionnaireId]);

            /*FETCHING UNIQUE ID*/
            const fetchUniqueId: any = await this._userProfileBasicsModel.findOne({ user_id: userId }, { unique_id: 1 });
            global.logs.writelog(apiname_with_trace_id, ['fetchUniqueId: ', fetchUniqueId]);

            if (getLastQuestionnaireId.length > 0) {
                const lastQuestionnaireId = getLastQuestionnaireId[0].questionnaire_id;

                // 1. RUN PROFILE UPDATE WITH QUES SUBMIT STATUS
                const userUpdatePromise = this._userProfileBasicsModel.update(
                    { user_id: userId },
                    { $set: { ques_submit_status: lastQuestionnaireId } }
                );

                // 2. OPTIONALLY PREPARE STATUS CHECK/UPDATE
                let checkUserStatus: any = null;
                let checkAndUpdatePromise = (async () => {
                    checkUserStatus = await this._authUserModel.findByAnyOne({
                        attributes: ['user_status', 'registration_status'],
                        where: { auth_user_id: userId }
                    });

                    global.logs.writelog(apiname_with_trace_id, ['checkUserStatus : ', checkUserStatus]);

                    if (checkUserStatus.registration_status == 4 && lastQuestionnaireId == USER_CONFIGS.LAST_QUESTIONNAIRE_TYPE_ID) {
                        initialAnswersActivity = 1;
                        const updateRegistrationStatus = await this._authUserModel.updateAnyRecord({
                            user_status: 3,
                            registration_status: 5
                        }, {
                            where: { auth_user_id: userId }
                        });
                        global.logs.writelog(apiname_with_trace_id, ['updateRegistrationStatus : ', updateRegistrationStatus]);
                    }
                })();

                // WAIT FOR BOTH TO COMPLETE
                await Promise.all([userUpdatePromise, checkAndUpdatePromise]);

                let userActivityData: IuserActivityData | null = null;
                if (initialAnswersActivity) { // FOR INITIAL ENTRY AS A NEW USER
                    // WILL PUT EMPTY ARRAY IN USER_PROFILE_ACTIVITES COLLECTION
                    userActivityData = {
                        user_id: userId,
                        unique_id: fetchUniqueId.unique_id,
                        is_new_user: true,
                        timestamp: new Date(),
                        updated_fields_json: []
                    };
                    /*SENDING DATA TO USER PROFILE ACTIVITIES */
                    const sendingDatatoUserActivity: any = await this._userProfileActivities.addNewRecord(userActivityData);
                    global.logs.writelog(apiname_with_trace_id, ["sendingDatatoUserActivity: ", sendingDatatoUserActivity]);
                } else if (checkUserStatus.user_status == 3) { // FOR OLD ACTIVE USERS
                    userActivityData = {
                        user_id: userId,
                        unique_id: fetchUniqueId.unique_id,
                        is_new_user: false,
                        timestamp: new Date(),
                        updated_fields_json: reqData.answers_data.flatMap(section =>
                            section.answers.map(answer => ({
                                field_name: answer.field_name,
                                field_value: answer.field_value
                            }))
                        )
                    };
                    /*SENDING DATA TO RABBIT MQ */
                    const sendingDataToQueue: any = await this._rabbitMqHelper.sendTaskToRabbitMQ(userActivityData);
                    global.logs.writelog(apiname_with_trace_id, ["sendingDataToQueue: ", sendingDataToQueue]);
                }
            }
            return global.Helpers.makeSuccessServiceStatus("Answers saved successfully.", {});
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Chumki Chakraborty
     * @Date: 31-03-2025
     * @Function: get Questions
    */
    getQuestions = async (reqData: IgetQuestionsReq) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getQuestions - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            let questionsList: any = []
            let whereObj: PipelineStage | null = null;

            if (reqData.questionnaire_type_id) {
                whereObj = { $match: { questionnaire_type_id: Number(reqData.questionnaire_type_id) } }

            }
            /* IF "questionnaire_type_id" IS PRESENT IN REQUEST THEN FETCH ONLY MATCHING DATA */
            questionsList = await this._masterProfileQuestion.findAggregate([
                ...(whereObj ? [whereObj] : []),
                {
                    $project: {
                        _id: 0,
                    }
                },
                {
                    $sort: {
                        questionnaire_type_id: 1
                    }
                }
            ]);
            global.logs.writelog(apiname_with_trace_id, ["categoriesList : ", questionsList])

            return global.Helpers.makeSuccessServiceStatus("Questions List fetched successfully.", { questionsList });
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 02-04-2025
     * @Function: get Answers
    */
    getAnswers = async (reqData: IgetAnswersReq) => {
        this.initLog();
        const apiname_with_trace_id = 'getAnswers - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0; // Use decrypted user_id in actual implementation
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            let ansCond: any = { user_id: userId };
            if (reqData.questionnaire_type_id) { /*IF QUESTIONNAIRE ID IS PRESENT,THEN ANSCOND OBJECT WILL QUESTIONNAIRE ID PROPERTY*/
                ansCond.questionnaire_id = Number(reqData.questionnaire_type_id);
            }

            const matchStage = { $match: ansCond };

            const projectStage: any = { /*THIS WILL DECIDE WHICH FIELD WILL BE SHOWN OR NOT DURING RESULT */
                $project: {
                    _id: 0,
                    updatedAt: 1,
                    user_id: 1,
                    questionnaire_id: 1,
                    answers: 1
                }
            };

            const pipeline: any[] = [matchStage];

            if (reqData.question_id) { /* IF QUESTION ID IS PRESENT,THEN ONLY PARTICULAR Q ID WILL BE SHOWN */
                const questionId = Number(reqData.question_id);
                pipeline.push(
                    {
                        $set: {
                            answers: {
                                $filter: {
                                    input: "$answers",
                                    as: "answer",
                                    cond: { $eq: ["$$answer.q_id", questionId] }
                                }
                            }
                        }
                    }
                );
            }

            pipeline.push(projectStage);
            /*FETCHING RESPONSE*/
            const allAnswersList = await this._userAnswersModel.findAggregate(pipeline);
            global.logs.writelog(apiname_with_trace_id, ["allAnswersList : ", allAnswersList]);

            return global.Helpers.makeSuccessServiceStatus("Answers List fetched successfully.", { answersList: allAnswersList });
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Chumki Chakraborty
     * @Date: 01-04-2025
     * @Function: profile Images
    */
    profileImages = async (reqData: IprofileImages) => {
        this.initLog();
        const apiname_with_trace_id: string = 'profileImages - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            let profile_image: string = '';

            /* CHECK LOGGED USER IS VALID USER OR NOT IF NOT THEN THROW ERROR */
            let isvalidUserOrNot: any = await this._authUserModel.findByAnyOne({
                attributes: ['registration_status', 'unique_id'],
                where: {
                    auth_user_id: userId
                }
            })
            if (!isvalidUserOrNot) {
                return global.Helpers.makeBadServiceStatus("Invalid user.");
            }
            global.logs.writelog(apiname_with_trace_id, ["isvalidUserOrNot:", isvalidUserOrNot]);
            isvalidUserOrNot = JSON.parse(JSON.stringify(isvalidUserOrNot))

            /* CHECK USER IS PRESNT IN  user_profile_images COLLECTION*/
            let getUserImages: any = await this._userProfileImages.findOne({ user_id: userId }, { images: 1 })
            let checkUserIsPresentOrNot: number = getUserImages ? 1 : 0;

            global.logs.writelog(apiname_with_trace_id, ["checkUserIsPresentOrNot : ", checkUserIsPresentOrNot])
            let isFirstImage = true;
            let store_files_data: any = []
            if (reqData.upload_files && reqData.upload_files.length > 0) {
                let s3Err = 0;
                for (let file of reqData.upload_files) {
                    let originalFileName = file.originalFilename;
                    let fileName: string = '';
                    if (originalFileName) {
                        let fileExtn = originalFileName.split('.').pop();
                        fileName = (checkUserIsPresentOrNot > 0)
                            ? global.Helpers.generateFileName(originalFileName)
                            : isFirstImage ? global.Helpers.generateFileName(`${originalFileName.split('.').slice(0, -1).join('_')}_${isvalidUserOrNot.unique_id}_me.${fileExtn}`) : global.Helpers.generateFileName(originalFileName);

                        /* REDUCE IMAGE SIZE */
                        const dynamicQuality = global.Helpers.getDynamicQuality(file.size)
                        /* RESIZE OBJECT */
                        const resizeObj = {
                            fromPath: file.path,
                            toPath: 'public/uploads/temp/' + fileName,
                            img_ext: fileExtn,
                            quality: dynamicQuality
                        };
                        /* COMPRESSING IMAGE */
                        const new_resize_image_obj = await global.Helpers.reduceImageQuality(resizeObj);
                        /* CREATE NEW RESIZE IMAGE WHICH IS UPLOAD IN S3 */
                        let new_resize_image = [
                            {
                                fieldName: file.fieldName,
                                originalFilename: fileName,
                                path: resizeObj.toPath,
                                size: new_resize_image_obj.size
                            }
                        ];
                        // UPLOAD FILE TO S3 BUCKET
                        let s3Upload = await this._image_service.fileUploadService(new_resize_image, { opt_for: 'profile_images', file_name: fileName });
                        global.logs.writelog(apiname_with_trace_id, ["s3Upload_response : ", { s3Upload }]);
                        if (!s3Upload) {
                            s3Err++;
                        } else {
                            /*REMOVE FROM LOCAL FOLDER*/
                            fs.unlink(resizeObj.toPath, (err => {
                                if (err) {
                                    global.logs.writelog(apiname_with_trace_id, ["file_unlink_error : : ", { err }]);
                                }
                            }));
                            /* ADD THE ARRAY OF OBJECT TO BE INSERTED INTO DB */
                            store_files_data.push({
                                image_name: fileName,
                                image_ext: fileExtn,
                                is_main_image: checkUserIsPresentOrNot > 0 ? false : isFirstImage ? true : false,
                                is_verified: false,
                                modification_timestamp: new Date()
                            });
                            isFirstImage = false; // SET is_main_image FALSE AFTER FIRST ITERATION
                            profile_image = checkUserIsPresentOrNot > 0 ? '' : isFirstImage ? fileName : ''
                        }
                    }
                }

            }

            if (store_files_data.length > 0) {
                if (checkUserIsPresentOrNot > 0) {
                    /* ADD NEW IMAGES INTO EXISTING IMAGES ARRAY */
                    let updateResult = await this._userProfileImages.update(
                        { user_id: userId },
                        {
                            $push: {
                                images: {
                                    $each: store_files_data
                                }
                            },
                            $set: { updatedAt: new Date() }
                        }
                    );
                    global.logs.writelog(apiname_with_trace_id, ['updateResult : ', updateResult]);
                } else { // ADD IMAGES
                    let addUserImages: any = await this._userProfileImages.addNewRecord({
                        user_id: userId,
                        images: store_files_data  // This matches your MongoDB structure
                    });
                    global.logs.writelog(apiname_with_trace_id, ['addUserImages : ', addUserImages]);
                }

                let totalImageCount: number = (getUserImages ? getUserImages.images.length : 0) + store_files_data.length;
                let updateObj: any = {
                    photo_updated_datetime: Sequelize.literal('now()'),
                }
                if ([2, 3].includes(isvalidUserOrNot.registration_status) && totalImageCount >= 3) {
                    /* UPDATE REGISTRATION_STATUS IN AUTH_USERS TABLE */
                    updateObj.registration_status = 4 // 4 => PROFILE PICTURE UPLOADED
                }

                const updateAuthUserData: any = await this._authUserModel.updateAnyRecord(
                    updateObj,
                    {
                        where: {
                            auth_user_id: userId
                        }
                    });
                global.logs.writelog(apiname_with_trace_id, ['updateAuthUserData : ', updateAuthUserData]);
            }

            if (reqData.set_dp_pos != "" && Number(reqData.set_dp_pos) >= 0) {
                const currentMainImageIndex = await this._userProfileImages.findAggregate([
                    { $match: { user_id: userId } },
                    {
                        $project: {
                            _id: 0,
                            images: 1,
                            main_image_index: {
                                $indexOfArray: [
                                    "$images.is_main_image",
                                    true
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            imageIndex: "$main_image_index",
                            image_name: {
                                $arrayElemAt: ["$images.image_name", "$main_image_index"]
                            }
                        }
                    }
                ]);
                global.logs.writelog(apiname_with_trace_id, ["currentMainImageIndex:", currentMainImageIndex]);
                /* FETCH  set_dp_pos WISE IMAGE NAME */
                let position = Number(reqData.set_dp_pos)
                const fetchSetDpPositionWiseImageName = await this._userProfileImages.findAggregate([
                    { $match: { user_id: userId } },
                    {
                        $project: {
                            ImageName: { $arrayElemAt: ["$images.image_name", position] }
                        }
                    }
                ])
                global.logs.writelog(apiname_with_trace_id, ["fetchSetDpPositionWiseImageName:", fetchSetDpPositionWiseImageName]);

                let newImageName: string = fetchSetDpPositionWiseImageName[0].ImageName;

                if (currentMainImageIndex.length > 0 && (fetchSetDpPositionWiseImageName.length > 0 && fetchSetDpPositionWiseImageName[0].ImageName)) {
                    if (currentMainImageIndex[0].imageIndex != position) { // SKIP THE OPERATION IF THE EXISITING DP IMAGE AND NEW DP IMAGE POS IS SAME
                        /* GET OLD IMAGE EXTN NAME WHICH IS PRESNT IN DB */
                        let getOldImageExtn = currentMainImageIndex[0].image_name.split('.')[1]
                        /* REPLACE OLD MAIN IMAGE NAME. REMOVE UNIQUE ID AND _ME FROM OLD MAIN IMAGE */
                        let replaceOldImageName = currentMainImageIndex[0].image_name.split('_');
                        replaceOldImageName.splice(-2, 2);
                        let renameOldMainImageName = replaceOldImageName.join('_') + "." + getOldImageExtn
                        /* CEATE NEW MAIN IMAGE NAME WHICH IS SET FOR CURRENT PROFILE PICTURE */
                        let getNewImgExtn = fetchSetDpPositionWiseImageName[0].ImageName.split('.')
                        newImageName = getNewImgExtn[0] + "_" + isvalidUserOrNot.unique_id + "_me." + getNewImgExtn[1]
                        /* UPDATE is_main_image,image_name,modification_timestamp VALUE */
                        let updateData = await this._userProfileImages.update(
                            { "user_id": userId },
                            {
                                $set: {
                                    [`images.${currentMainImageIndex[0].imageIndex}.image_name`]: renameOldMainImageName,
                                    [`images.${currentMainImageIndex[0].imageIndex}.is_main_image`]: false,
                                    [`images.${currentMainImageIndex[0].imageIndex}.modification_timestamp`]: new Date(),
                                    [`images.${position}.image_name`]: newImageName,
                                    [`images.${position}.is_main_image`]: true,
                                    [`images.${position}.modification_timestamp`]: new Date()
                                }
                            }
                        );
                        global.logs.writelog(apiname_with_trace_id, ["updateData:", updateData]);

                        const [
                            renameOldMainImageNameInS3,
                            renameCurrentMainImageNameInS3
                        ] = await Promise.all([
                            this._S3Helper.renameFileInS3(
                                s3_folder_path.s3_user_profile_images_path + currentMainImageIndex[0].image_name,
                                s3_folder_path.s3_user_profile_images_path + renameOldMainImageName
                            ),
                            this._S3Helper.renameFileInS3(
                                s3_folder_path.s3_user_profile_images_path + fetchSetDpPositionWiseImageName[0].ImageName,
                                s3_folder_path.s3_user_profile_images_path + newImageName
                            )
                        ]);

                        global.logs.writelog(apiname_with_trace_id, ["renameOldMainImageNameInS3:", renameOldMainImageNameInS3]);
                        global.logs.writelog(apiname_with_trace_id, ["renameCurrentMainImageNameInS3:", renameCurrentMainImageNameInS3]);
                    }
                }
                profile_image = fetchSetDpPositionWiseImageName.length > 0 ? newImageName : '';
            }
            profile_image = profile_image == '' ? '' : (await this._S3Helper.getsignedUrl(s3_folder_path.s3_user_profile_images_path + profile_image)).signedUrl;

            /* CREATE NEW UPLOADED IMAGES SIGNED URL */
            let addSignedImageUrl: any = [];
            if (reqData.upload_files && reqData.upload_files.length > 0) {
                let uploadFileLength: number = (reqData.upload_files.length)
                let fetchImageDetails = await this._userProfileImages.findAggregate([
                    { $match: { user_id: userId } },
                    {
                        $project: {
                            _id: 0,
                            lastImages: {
                                $slice: ["$images", -uploadFileLength]
                            }
                        }
                    }
                ])
                global.logs.writelog(apiname_with_trace_id, ["fetchImageDetails:", fetchImageDetails]);
                fetchImageDetails = JSON.parse(JSON.stringify(fetchImageDetails[0]));

                /* ADD IMAGE SIGNED URL */
                addSignedImageUrl = await Promise.all(
                    fetchImageDetails.lastImages.map(async (user: any) => {
                        const signedUrlResponse = await this._S3Helper.getsignedUrl(
                            s3_folder_path.s3_user_profile_images_path + user.image_name
                        );
                        return {
                            image_path: signedUrlResponse.signedUrl,
                            is_main_image: user.is_main_image,
                            is_verified: user.is_verified,
                        };
                    })
                );

            }
            let images = addSignedImageUrl ? addSignedImageUrl : [];
            return global.Helpers.makeSuccessServiceStatus("Profile images uploaded successfully.", { profile_image, images });
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Chumki Chakraborty
     * @Date: 02-04-2025
     * @Function: Delet Profile Image
    */
    deletProfileImage = async (reqData: IdeletProfileImage) => {
        this.initLog();
        const apiname_with_trace_id: string = 'deletProfileImage - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            /* CHECK VALID USER OR NOT IF NOT THEN THROW ERROR */
            const isvalidUserOrNot: any = await this._authUserModel.findByAnyOne({
                attributes: ['user_status'],
                where: {
                    auth_user_id: userId
                }
            });
            global.logs.writelog(apiname_with_trace_id, ['isvalidUserOrNot : ', isvalidUserOrNot]);

            if (!isvalidUserOrNot) {
                return global.Helpers.makeBadServiceStatus("Invalid user.");
            }
            /* GET IMAGE DETAILS WHERE image_name IS NOT BLANK FROM user_profile_images COLLECTION */
            let getImageDetails: any = await this._userProfileImages.findAggregate([
                {
                    $match: {
                        "user_id": userId
                    }
                },

                {
                    $project: {
                        _id: 0,
                        "images": {
                            image_name: 1,
                            image_ext: 1,
                            is_main_image: 1,
                            is_verified: 1,
                            modification_timestamp: 1
                        }
                    }
                }
            ])
            global.logs.writelog(apiname_with_trace_id, ["getImageDetails :", getImageDetails]);

            /* FETCH TOTAL IMAGES ARRAY LENGTH COUNT */
            let totalImageCount = getImageDetails[0].images.length;
            /* GET TOTAL IMAGE COUNT IN DB */
            let checkImageCount: number = (totalImageCount - reqData.delete_position.length)
            /* IF IMAGE COUNT LESS THEN 3 THEN REVERT THE STATUS IN REGISTRATION FLOW */
            if (checkImageCount < 3 && isvalidUserOrNot.user_status == 2) {
                let revertUserStatus = await this._authUserModel.updateAnyRecord({
                    registration_status: 3
                }, {
                    where: {
                        auth_user_id: userId
                    }
                });
                global.logs.writelog(apiname_with_trace_id, ['revertUserStatus : ', revertUserStatus]);
            }
            /* CHECK IF THE MAIN IMAGE IS TRUE OF FALSE IF THE is_main_image IS TRUE THEN THROW ERROR*/
            for (const index of reqData.delete_position) {

                if (getImageDetails[0].images[index] && getImageDetails[0].images[index].is_main_image == true) {

                    return global.Helpers.makeBadServiceStatus(`You cannot delete profile image.`);
                }
            }
            /* VALIDATE THE DELETE POSITION ARRAY AND CHECK IF THE INDEXS ARE VALID */
            const deletePositions = reqData.delete_position;
            /* FETCH DELETE IMAGES DATA */
            const deletedImages = deletePositions.map(index => {
                return getImageDetails[0].images[index]; // Return the image at the given index
            })
            global.logs.writelog(apiname_with_trace_id, ["deletedImages :", deletedImages]);

            /* UPDATED IMAGES ARRAY AFTER DELETATION */
            const updatedImages = getImageDetails[0].images.filter((image: any, index: any) => !deletePositions.includes(index));
            global.logs.writelog(apiname_with_trace_id, ["updatedImages :", updatedImages]);
            // Then use it in your map function:
            const getnewImages = updatedImages.map((image: IprofileImage) => ({
                image_name: image.image_name,
                image_ext: image.image_ext,
                is_main_image: image.is_main_image,
                is_verified: image.is_verified,
                modification_timestamp: image.modification_timestamp || new Date(), // Only add if missing
            }));
            global.logs.writelog(apiname_with_trace_id, ["getnewImages :", getnewImages]);

            if (getnewImages.length > 0) {

                /* UPDATE IMAGES ARRAY */
                let updateUserProfileImage = await this._userProfileImages.update(
                    { user_id: userId },
                    { $set: { images: getnewImages } }
                );

                global.logs.writelog(apiname_with_trace_id, ['updateUserProfileImage : ', updateUserProfileImage]);

                /*LOOP THROUGH TO GET FULL IMAGE NAME FOR DELETE FROM S3 */
                for (const image of deletedImages) {
                    let deleteFileFromS3 = await this._image_service.imageDelete(image.image_name + "." + image.image_ext, s3_folder_path.s3_user_profile_images_path);
                    global.logs.writelog(apiname_with_trace_id, ['deleteFileFromS3 : ', deleteFileFromS3]);
                }
            }
            return global.Helpers.makeSuccessServiceStatus("Images deleted successfully.", {});
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 03-04-2025
     * @Function: view profile
    */
    viewProfile = async (reqData: any) => {
        this.initLog();
        const apiname_with_trace_id = 'viewProfile - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0; // Use decrypted user_id in actual implementation
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            const findUsers: any = await this._authUserModel.findByAnyOne({
                attributes: ['user_type', 'user_status', 'registration_status', 'user_email', 'unique_id'],
                where: { auth_user_id: userId }
            });
            global.logs.writelog(apiname_with_trace_id, ['findUsers: ', findUsers]);
            if (!findUsers) {
                return global.Helpers.makeBadServiceStatus("User not found.");
            }
            /* AGGREGATING USERS WITH PROFILE IMAGES */
            let userWithImages: any = await this._userProfileBasicsModel.findAggregate([
                {
                    $match: { user_id: userId }
                },
                {
                    $lookup: {
                        from: "user_profile_images",
                        let: { uid: "$user_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$user_id", "$$uid"] }
                                }
                            },
                            { $unwind: "$images" }, // Important: Unwind images array
                            {
                                $match: {
                                    "images.is_main_image": true
                                }
                            },
                            {
                                $project: {
                                    image_name: "$images.image_name",
                                    _id: 0
                                }
                            }
                        ],
                        as: "main_image"
                    }
                },
                {
                    $unwind: { path: "$main_image", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        _id: 0,
                        user_first_name: 1,
                        ques_submit_status: 1,
                        introduction: 1,
                        phone_number: "$user_phone_number",
                        gender: "$user_gender",
                        country: "$user_region",
                        zipcode: "$user_zip",
                        city: "$user_city",
                        dob: "$user_dob",
                        profile_completeness: "35%",
                        profile_image: { $ifNull: ["$main_image.image_name", ""] },
                        university: 1,
                        political_view: 1
                    }
                }
            ]);
            global.logs.writelog(apiname_with_trace_id, ['userWithImages : ', userWithImages]);
            /*MODIFYING RESPONSE*/
            let uImages = JSON.parse(JSON.stringify(userWithImages[0]));
            global.logs.writelog(apiname_with_trace_id, ['uImages : ', uImages]);
            /* ADD IMAGE SIGNED URL */
            uImages.profile_image = uImages.profile_image ? (await this._S3Helper.getsignedUrl(
                s3_folder_path.s3_user_profile_images_path + uImages.profile_image
            )).signedUrl : "";
            /* ADD DATA INSIDE uImages WHICH COMMING FROM findUsers*/
            uImages.email = findUsers.user_email;
            uImages.user_type = findUsers.user_type;
            uImages.unique_id = findUsers.unique_id;
            uImages.user_status = findUsers.user_status == 3 ? (findUsers.registration_status == 5 ? 2 : findUsers.user_status) : findUsers.user_status;
            uImages.registration_status = findUsers.registration_status;
            return global.Helpers.makeSuccessServiceStatus("Profile details fetched successfully.", uImages);
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 21-04-2025
     * @Function: recommended user profile
    */
    recommendedUserProfile = async (reqData: IrecommendedProfile) => {
        this.initLog();
        const apiname_with_trace_id = 'recommendedUserProfile - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            /* AGGREGATING USERS WITH PROFILE IMAGES AND ANSWERS LISTS*/
            let userWithImagesAndQuestions: any = await this._userProfileBasicsModel.findAggregate([
                {
                    $match: { unique_id: reqData.unique_id }
                },
                {
                    $lookup: {
                        from: "user_profile_images",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "images"
                    }
                },
                {
                    $lookup: {
                        from: "user_answers",
                        localField: "user_id",
                        foreignField: "user_id",
                        as: "answersList"
                    }
                },
                {
                    $unwind: { path: "$images", preserveNullAndEmptyArrays: true }
                },
                {
                    $project: {
                        _id: 0,
                        user_first_name: 1,
                        gender: "$user_gender",
                        country: "$user_country",
                        zipcode: "$user_zip",
                        city: "$user_city",
                        dob: "$user_dob",
                        images: "$images.images",
                        answersList: {
                            $map: {
                                input: "$answersList",
                                as: "ans",
                                in: {
                                    questionnaire_id: "$$ans.questionnaire_id",
                                    answers: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$$ans.answers",
                                                    as: "a",
                                                    cond: {
                                                        $in: ["$$a.q_id", USER_CONFIGS.DISPLAY_QUESTIONS]
                                                    }
                                                }
                                            },
                                            as: "filtered",
                                            in: {
                                                q_id: "$$filtered.q_id",
                                                sel_opt_id: "$$filtered.sel_opt_id"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]);
            global.logs.writelog(apiname_with_trace_id, ['userWithImagesAndQuestions : ', userWithImagesAndQuestions]);

            //MODIFY RESPONSE
            /* IF THERE IS ANY DATA FOUND*/
            if (userWithImagesAndQuestions.length > 0) {
                let userData: IuserData = userWithImagesAndQuestions[0];
                let modifiedImageResponse: any = await Promise.all((userWithImagesAndQuestions[0]?.images || [])?.map(async (item: any) => {
                    const signedUrlResponse = await this._S3Helper.getsignedUrl(
                        s3_folder_path.s3_user_profile_images_path + item.image_name
                    );
                    return ({
                        image_path: item?.image_name == '' ? '' : signedUrlResponse.signedUrl,
                        is_main_image: item?.is_main_image
                    })
                }))
                userData.images = modifiedImageResponse;
                return global.Helpers.makeSuccessServiceStatus("Profile details fetched successfully.", userData);
            } else {
                return global.Helpers.makeBadServiceStatus("User not found!");
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 22-04-2025
     * @Function: get profile
    */
    getProfile = async (reqData: IgetProfile) => {
        this.initLog();
        const apiname_with_trace_id = 'getProfile - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            const user_details: any = await this._userProfileBasicsModel.findOne(
                { unique_id: reqData.unique_id },
                {
                    _id: 0,
                    user_id: 1,
                    user_first_name: 1,
                    user_gender: 1,
                    user_country: 1,
                    user_zip: 1,
                    user_city: 1,
                    user_dob: 1
                }
            );
            global.logs.writelog(apiname_with_trace_id, ['user_details : ', user_details]);
            if (!user_details) {
                return global.Helpers.makeBadServiceStatus("Invalid user!");
            }
            let user_id = user_details.user_id;
            const final_result: Array<{ field_name: string; field_value: string[] }> = [];

            const user_answers_list = await this._userAnswersModel.getUserAnswersList(user_id);
            global.logs.writelog(apiname_with_trace_id, ['user_answers_list : ', user_answers_list]);

            if (user_answers_list && user_answers_list.length > 0) {
                const question_map: Record<string, any> = {};
                user_answers_list.map((answer_doc: any) => {
                    const questionnaire_id = answer_doc.master_questions.questionnaire_type_id;
                    return (answer_doc.master_questions.questions || []).map((question: any) => {
                        const q_id = question.q_id;
                        question_map[`${questionnaire_id}_${q_id}`] = {
                            field_name: question.field_name || "",
                            selection_type: question.selection_type || 0,
                            options: question.options || [],
                            opt_map: Object.fromEntries(
                                (question.options || []).map((opt: any) => [String(opt.op_id), opt.en])
                            )
                        };
                    });
                });

                user_answers_list.map((answer_doc: any) => {
                    const questionnaire_id = answer_doc.master_questions.questionnaire_type_id;

                    return (answer_doc.answers || []).map((ans: any) => {
                        const q_id = ans.q_id;
                        const sel_opt_ids = ans.sel_opt_id || [];

                        const question_key = `${questionnaire_id}_${q_id}`;
                        if (!(question_key in question_map)) {
                            return null;
                        }

                        const question_info = question_map[question_key];
                        const field_name = question_info.field_name;
                        const selection_type = question_info.selection_type;

                        const opt_map = question_info.opt_map;
                        let field_value: string[] = [];

                        if (sel_opt_ids.length > 0) {
                            if (selection_type === 0) {  // SINGLE SELECT
                                field_value = [opt_map[String(sel_opt_ids[0])] || ""];
                            } else if (selection_type === 1) {  // MULTI SELECT
                                field_value = sel_opt_ids.map((opt_id: any) => opt_map[String(opt_id)]).filter(Boolean);
                            } else if (selection_type === 2) {  // RANGE
                                field_value = [`${sel_opt_ids[0]}-${sel_opt_ids[1]}`];
                            } else if (selection_type === 3) {  // SINGLE RANGE
                                field_value = [String(sel_opt_ids[0])];
                            }
                        }

                        final_result.push({
                            field_name: field_name,
                            field_value: field_value
                        });

                        return null;
                    });
                });
            }
            return global.Helpers.makeSuccessServiceStatus("Profile details fetched successfully.", {
                user_first_name: user_details.user_first_name,
                gender: user_details.user_gender,
                country: user_details.user_country,
                zipcode: user_details.user_zip,
                city: user_details.user_city,
                dob: user_details.user_dob,

                answerFields: final_result
            })
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 23-04-2025
     * @Function: get all images
    */
    getAllImages = async (reqData: IgetAllImages) => {
        this.initLog();
        const apiname_with_trace_id = 'getAllImages - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0; // Use decrypted user_id in actual implementation
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);
            /* FINDING USER SPECIFIC IMAGES*/
            const userImages: any = await this._userProfileImages.findAggregate([
                {
                    $match: { user_id: userId }
                },
                {
                    $project: {
                        _id: 0,
                        images: {
                            $map: {
                                input: { $ifNull: ["$images", []] },
                                as: "img",
                                in: {
                                    image_path: "$$img.image_name",
                                    is_main_image: "$$img.is_main_image",
                                    is_verified: "$$img.is_verified"
                                }
                            }
                        }
                    }
                }
            ]);
            global.logs.writelog(apiname_with_trace_id, ['userImages: ', userImages]);

            let uImages: IuserImages = {
                images: []
            }
            /* IF IMAGES WITH THE USER ID EXISTS*/
            if (userImages.length > 0) {
                uImages = userImages[0];
                let modifiedImageResponse: any = await Promise.all((userImages[0]?.images || [])?.map(async (item: any) => {
                    const signedUrlResponse = await this._S3Helper.getsignedUrl(
                        s3_folder_path.s3_user_profile_images_path + item.image_path
                    );
                    return ({
                        image_path: item?.image_path == '' ? '' : signedUrlResponse.signedUrl,
                        is_main_image: item?.is_main_image,
                        is_verified: item?.is_verified
                    })
                }));
                uImages.images = modifiedImageResponse;
            }
            return global.Helpers.makeSuccessServiceStatus("All Images fetched successfully.", uImages)
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }

    /**
     * @Developer: Sumit Sil
     * @Date: 30-04-2025
     * @Function: Get Pose Compare
    */
    comparePose = async (reqData: IcomparePose, token: string) => {
        this.initLog();
        const apiname_with_trace_id = 'comparePose - ' + global.Helpers.getTraceID(reqData);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', reqData]);
        try {
            /* IF LOGINDETAILS TAG PRESENT IN REQUEST. THEN DECRYPT THE USER ID
            (THIS LOGINDETAILS TAG WAS ADDED IN VALIDATETOKEN FUNCTION FROM MIDDLEWARE) */
            const userId = reqData.loginDetails ? Number(global.Helpers.decryptId(reqData.loginDetails.verifiedData.param.user_id)) : 0;
            global.logs.writelog(apiname_with_trace_id, ["userId:", userId]);

            let checkValidUser: any = await this._authUserModel.findByAnyOne({
                attributes: ['is_selfie_verified'],
                where: {
                    auth_user_id: userId
                }
            })
            global.logs.writelog(apiname_with_trace_id, ["checkValidUser:", checkValidUser]);

            if (!checkValidUser) {
                return global.Helpers.makeBadServiceStatus("Invalid user.");
            }

            if (checkValidUser.is_selfie_verified == 1) {
                return global.Helpers.makeBadServiceStatus("Selfie already verified.");
            }

            // CHECK THE USER IS PRESENT IN PROFILE IMAGES TABLE OR NOT
            let checkUserImages: any = await this._userProfileImages.findOne({ user_id: userId }, { selfie_image: 1 });
            global.logs.writelog(apiname_with_trace_id, ["checkUserImages:", checkUserImages]);

            if (reqData.uploaded_file && reqData.uploaded_file.length > 0) {
                let s3Err = 0;
                let file = reqData.uploaded_file[0];
                let originalFileName = file.originalFilename;
                let fileName: string = '';
                if (originalFileName) {
                    fileName = global.Helpers.generateFileName(originalFileName);

                    // UPLOAD FILE TO S3 BUCKET
                    let s3Upload = await this._image_service.fileUploadService(reqData.uploaded_file, { opt_for: 'profile_images', file_name: fileName });
                    global.logs.writelog(apiname_with_trace_id, ["s3Upload_response : ", { s3Upload }]);
                    if (!s3Upload) {
                        s3Err++;
                    }
                }

                if (fileName) {
                    if (checkUserImages) {
                        // UPDATE THE RECORD
                        let updateUserSelfieImage = await this._userProfileImages.update(
                            { user_id: userId },
                            { selfie_image: fileName }
                        );
                        global.logs.writelog(apiname_with_trace_id, ['updateUserSelfieImage : ', updateUserSelfieImage]);

                        // DELETE THE OLD IMAGE FROM HERE
                        if (checkUserImages.selfie_image) { // IF SELFIE IMAGE WAS PRESENT, THEN DELETE THAT OLD IMAGE
                            let deleteFileFromS3 = await this._image_service.imageDelete(checkUserImages.selfie_image, s3_folder_path.s3_user_profile_images_path);
                            global.logs.writelog(apiname_with_trace_id, ['deleteFileFromS3 : ', deleteFileFromS3]);
                        }
                    } else { // ADD IMAGES
                        let addUserSelfieImage: any = await this._userProfileImages.addNewRecord({
                            user_id: userId,
                            images: [],
                            selfie_image: fileName
                        });
                        global.logs.writelog(apiname_with_trace_id, ['addUserSelfieImage : ', addUserSelfieImage]);
                    }
                    let selfie_path = (await this._S3Helper.getsignedUrl(s3_folder_path.s3_user_profile_images_path + fileName)).signedUrl;
                    let dataObj = {
                        selfie_path: selfie_path,
                        reference_path: reqData.match_pose
                    }
                    if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                        // Remove Bearer from string
                        token = token.slice(7, token.length);
                    }
                    let getPoseCompare: any = await global.Helpers.callOtherMicroServicesWithAuthorization(
                        dataObj,
                        process.env.GRAPH_API_BASE_PATH as string,
                        '/v1/verification/get-pose-verify',
                        {
                            'content-type': 'application/json',
                            'Authorization': token
                        }
                    );
                    global.logs.writelog(apiname_with_trace_id, ["getPoseCompare:", getPoseCompare]);

                    if (!getPoseCompare.error) {
                        let updateSelieVerifiedStatus: any = await this._authUserModel.updateAnyRecord({
                            is_selfie_verified: getPoseCompare.data ? 1 : 0
                        }, {
                            where: {
                                auth_user_id: userId
                            }
                        })
                        global.logs.writelog(apiname_with_trace_id, ["updateSelieVerifiedStatus:", updateSelieVerifiedStatus]);

                        return global.Helpers.makeSuccessServiceStatus("Pose compared successfully.", { is_matched: getPoseCompare.data ? 1 : 0 });
                    }
                }
            }
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, ["ERROR:", error.stack]);
            return global.Helpers.makeBadServiceStatus("Something went wrong, please try again later.");
        }
    }
}