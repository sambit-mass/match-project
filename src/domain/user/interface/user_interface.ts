export interface IUserRegistration {
    user_first_name: string;
    email: string;
    password: string;
    phone_number: string;
    gender: number;
    country: string;
    city: string;
    dob: string;
    height: number;
    social_id: string;
    social_token: string;
    social_type: number;
    is_social_reg: number;
    is_verified: number;
    device_os_type?: number;
    app_version?: string;
    device_uid?: string;
    device_token?: string;
    device_name?: string;
    device_model?: string;
    device_version?: string;
    browser_id?: string;
    browser_version?: string;
    session_id?: string;
    browser_name?: string;
    zipcode: string;
    region: string;
    answers_data: {
        questionnaire_id: number;
        answers: {
            q_id: number;
            sel_opt_id: number[];
        }[];
    }[];
    registration_status: number;
}

export interface IVerifyOtp {
    otp: string;
    email: string;
    otp_for: number;
    device_os_type?: number;
    app_version?: string;
    device_uid?: string;
    device_token?: string;
    device_name?: string;
    device_model?: string;
    device_version?: string;
    browser_id?: string;
    browser_version?: string;
    session_id?: string;
    browser_name?: string;
}

export interface IgenerateAuthCodeObjByOtp {
    email: string;
    device_os_type?: number;
    app_version?: string;
    device_uid?: string;
    device_token?: string;
    device_name?: string;
    device_model?: string;
    device_version?: string;
    browser_id?: string;
    browser_version?: string;
    session_id?: string;
    browser_name?: string;
}


export interface ISendOtp {
    email: string;
    otp_for: number;
    is_resend: number;
}

export interface IForgotPasswordReq {
    email: string;
    otp: string;
    new_password: string;
}

export interface IChangePasswordReq {
    loginDetails?: Record<string, any>;
    old_password: string;
    new_password: string;
}

export interface IWhereObject {
    where: {
        user_email: string;
        [key: string]: any;  // This allows for dynamic keys in the `where` object
    };
}

export interface IGenerateAuthCodeReq {
    email: string;
    password: string;
    login_type: number;
    social_id?: string;
    social_token?: string;
    social_type?: number;
    device_os_type?: number;
    app_version?: string;
    device_uid?: string;
    device_token?: string;
    device_name?: string;
    device_model?: string;
    device_version?: string;
    browser_id?: string;
    browser_version?: string;
    session_id?: string;
    browser_name?: string;
}

export interface IfrontendUserRegistration {
    email: string | null;
    password: string;
    is_verified: string | number;
    is_social_reg: number;
    user_first_name: string;
    gender: number | null;
    country: string;
    zipcode: string;
    dob: string;
    answers_data: any[];
    registration_status: number;
    social_id?: string;
    social_token?: string;
    social_type?: number;
}

export interface IGenerateTokenReq {
    refresh_token: string;
    token_params: {
        username: string;
        user_id: string;
        user_type: number;
        client_id: string;
    };
}

export interface IRegenerateTokenReq {
    refresh_token: string;
}

export interface IGenerateTokenResponse {
    access_token: string;
    refresh_token: string;
    user_type: number;
    user_id: string;
    user_status: string;
    user_email: string;
    user_name: string;
    profile_image: string;
    login_type: number;
}

export interface IGenerateAuthCodeObj {
    email: string;
    device_os_type?: number;
    app_version?: string;
    device_uid?: string;
    device_token?: string;
    device_name?: string;
    device_model?: string;
    device_version?: string;
    browser_id?: string;
    browser_version?: string;
    session_id?: string;
    browser_name?: string;
    is_social_reg: number;
    social_id?: string;
}

export interface IGetUserProfile {
    loginDetails?: Record<string, any>;
}

export interface IUpdateUserProfileReq {
    loginDetails?: Record<string, any>;
    email: string;
    user_first_name: string;
    phone_number: string;
    gender: number;
    country: string;
    city: string;
    zipcode: string;
    dob: string;
    height: number;
    current_password: string;
    new_password: string;
    confirm_password: string;
    introduction: string;
    university: string;
    political_view: string;
}

export interface ICheckSocialLoginExists {
    social_id: string;
    user_type: number;
    social_email?: string;
}

export interface IAllNotificationsListReq {
    loginDetails?: Record<string, any>;
    page_no: number,
    rec_per_page: number,
}

export interface IUnreadNotificationCountReq {
    loginDetails?: Record<string, any>;
}

export interface ILogoutReq {
    loginDetails?: Record<string, any>;
    device_uid: string;
}


export interface IAnswerSave {
    loginDetails?: Record<string, any>;
    answers_data: {
        questionnaire_id: number;
        answers: {
            q_id: number;
            field_name: string;
            sel_opt_id: number[];
            sel_opt_text: string;
            field_value: [];
        }[];
    }[];
}

export interface IgetQuestionsReq {
    questionnaire_type_id: number
}

export interface IgetAnswersReq {
    loginDetails?: Record<string, any>;
    questionnaire_type_id?: number;
    question_id?: number
}

interface IUploadedFile {
    fieldName: string;
    originalFilename: string;
    path: string;
    headers: {
        'content-disposition': string;
        'content-type': string;
    };
    size: number;
}

export interface IprofileImages {
    loginDetails?: Record<string, any>;
    upload_files: IUploadedFile[];
    set_dp_pos: number | string;
}

export interface IdeletProfileImage {
    loginDetails?: Record<string, any>;
    delete_position: number[]
}
export interface IprofileImage {
    image_name: string;
    image_ext: string;
    is_main_image: boolean;
    is_verified: boolean;
    modification_timestamp: Date | { $date: string | Date };
}

export interface IuserActivityData {
    user_id: number;
    unique_id: string
    is_new_user: Boolean;
    timestamp: Date;
    updated_fields_json: {
        field_name: String;
        field_value: [];
    }[]
}

export interface ImainAnswerSave {
    user_id: number;
    questionnaire_id: number;
    answers: {
        q_id: number;
        sel_opt_id: number[];
        sel_opt_text: String
    }[]
}

export interface IrecommendedProfile {
    unique_id: string;
}


export interface IuserData {
    user_first_name: string;
    gender: number;
    country: string;
    zipcode: string;
    city: string;
    dob: string;
    introduction: {
        en: string;
        zh: string
    };
    images: {
        image_path: string;
        is_main_image: boolean
    }[];
    answersList: {
        questionnaire_id: number;
        answers: {
            q_id: number;
            sel_opt_id: number[]
        }[]
    }[]
}

export interface IgetProfile {
    unique_id: string;
}


export interface IuserActivitiesData {
    user_first_name: string;
    gender: number;
    country: string;
    zipcode: string;
    city: string;
    dob: string;
    introduction: {
        en: string;
        zh: string
    };
    answerFields: {
        field_name: string;
        field_value: []
    }[]
}

export interface IgetAllImages {
    loginDetails?: Record<string, any>;
}

export interface IuserImages {
    images: {
        image_path: string;
        is_main_image: boolean;
        is_verified: boolean
    }[]
}

export interface IcomparePose {
    loginDetails?: Record<string, any>;
    uploaded_file: IUploadedFile[];
    match_pose: string;
}