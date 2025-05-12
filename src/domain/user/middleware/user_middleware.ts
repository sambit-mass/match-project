import { check } from "express-validator";
import { Validator } from "../../../configuration/middleware_config";
import { FILE_CONFIG } from "../../file/file_config";

export class UserMiddleware {

    loginValidation(): object {
        return [
            // check('email').trim().toLowerCase().not().isEmpty().withMessage('Please enter Email address.').bail().isEmail().withMessage('Please enter valid email address.'),
            check('login_type').not().isEmpty().withMessage('Please provide login type.').bail().isIn([1, 2]).withMessage('Please provide valid login type.').custom((value: number, { req }) => {
                if (value == 2) {  // 2 => Social Login 
                    if (!req.body.social_id || req.body.social_id.trim() == '') {
                        throw new Error("Please provide valid social id.")
                    } else if (req.body.social_id.length > 1000) {
                        throw new Error('The maximum length allowed is 1000 characters.');
                    }
                    if (!req.body.social_token || req.body.social_token.trim() == '') {
                        throw new Error('Please provide social token.');
                    } else if (req.body.social_token.length > 1000) {
                        throw new Error('The maximum length allowed is 1000 characters.');
                    }
                    if (!req.body.social_type || req.body.social_type == '') {
                        throw new Error('Please provide social type.');
                    } else {
                        if (req.body.social_type != 1 && req.body.social_type != 2 && req.body.social_type != 3) {
                            throw new Error('Please provide valid social type.');
                        }
                    }
                } else {
                    if (!req.body.email || req.body.email.trim() == '') {
                        throw new Error("Please provide valid email id.")
                    }

                    if (req.body.password == "") {
                        throw new Error('Please provide password.');
                    } else if (req.body.password.length > 50) {
                        throw new Error('The maximum length allowed for password is 50 characters.');
                    }
                }
                return true;
            }),
            check('device_os_type').not().isEmpty().withMessage('Please provide device os type.').bail().isIn([1, 2, 3]).withMessage('Please provide valid device os type.').custom((value: any, { req }) => {
                if (value == 1 || value == 2) { // 1 => Android, 2 => Web 
                    if (!req.body.app_version || req.body.app_version.trim() == '') {
                        throw new Error('Please provide app version.');
                    } else if (req.body.app_version.length > 10) {
                        throw new Error('The maximum length allowed is 10 characters.');
                    }
                    if (!req.body.device_uid || req.body.device_uid.trim() == '') {
                        throw new Error('Please provide device uid.');
                    } else if (req.body.device_uid.length > 50) {
                        throw new Error('The maximum length allowed is 50 characters.');
                    }
                    if (!req.body.device_token || req.body.device_token.trim() == '') {
                        throw new Error('Please provide device token.');
                    } else if (req.body.device_token.length > 200) {
                        throw new Error('The maximum length allowed is 200 characters.');
                    }
                    if (!req.body.device_name || req.body.device_name.trim() == '') {
                        throw new Error('Please provide device name.');
                    } else if (req.body.device_name.length > 50) {
                        throw new Error('The maximum length allowed is 50 characters.');
                    }
                    if (!req.body.device_model || req.body.device_model.trim() == '') {
                        throw new Error('Please provide device model.');
                    } else if (req.body.device_model.length > 20) {
                        throw new Error('The maximum length allowed is 20 characters.');
                    }
                    if (!req.body.device_version || req.body.device_version.trim() == '') {
                        throw new Error('Please provide device version.');
                    } else if (req.body.device_version.length > 10) {
                        throw new Error('The maximum length allowed is 10 characters.');
                    }
                } else if (value == 3) { // 3 => Web
                    if (!req.body.browser_id || req.body.browser_id.trim() == '') {
                        throw new Error('Please provide browser id.');
                    } else if (req.body.browser_id.length > 250) {
                        throw new Error('The maximum length allowed is 250 characters.');
                    }
                    if (!req.body.browser_version || req.body.browser_version.trim() == '') {
                        throw new Error('Please provide browser version.');
                    } else if (req.body.browser_version.length > 50) {
                        throw new Error('The maximum length allowed is 50 characters.');
                    }
                    if (!req.body.session_id || req.body.session_id.trim() == '') {
                        throw new Error('Please provide session id.');
                    } else if (req.body.session_id.length > 250) {
                        throw new Error('The maximum length allowed is 250 characters.');
                    }
                    if (!req.body.browser_name || req.body.browser_name.trim() == '') {
                        throw new Error('Please provide browser name.');
                    } else if (req.body.browser_name.length > 80) {
                        throw new Error('The maximum length allowed is 80 characters.');
                    }
                }
                return true;
            })
        ];
    }

    generateTokenValidationRule(): object {
        return [
            check('authorization_code').trim().not().isEmpty().withMessage('Please provide authorization code.')
        ];
    }

    regenrateTokenValidationRule(): object {
        return [
            check('refresh_token').trim().not().isEmpty().withMessage('Please provide refresh token.')
        ];
    }

    userRegistrationValidation(): object {
        return [
            check('user_first_name').trim().not().isEmpty().withMessage('Please provide user first name.').bail().isString().isLength({ min: 1, max: 255 }).withMessage("The maximum length allowed is 255 characters.").bail().matches(Validator.common_regex).withMessage('You have entered an invalid user full name.').custom(value => {
                if (!isNaN(value)) {
                    throw new Error('You have entered an invalid user full name.');
                }
                return true;
            }),
            check('email').trim().toLowerCase().not().isEmpty().withMessage('Please enter Email address.').bail().isEmail().withMessage('Please enter valid email address.').bail().isLength({ min: 1, max: 255 }).withMessage("The maximum length allowed is 255 characters."),
            check('gender').not().isEmpty().withMessage('Please provide gender.').bail().isIn([0, 1, 2]).withMessage('Please provide valid gender.'),
            check('country').trim().not().isEmpty().withMessage('Please provide country.').bail().isString().isLength({ min: 1, max: 30 }).withMessage("The maximum length allowed is 30 characters.").bail().matches(Validator.common_regex).withMessage('Please provide valid country.'),
            check('zipcode').optional({ checkFalsy: true }).bail().isString().isLength({ min: 1, max: 20 }).withMessage("The maximum length allowed is 20 characters.").bail().matches(Validator.common_regex).withMessage('Please provide valid zipcode.'),
            check('dob').not().isEmpty().withMessage('Please enter date of birth.').isDate({ format: "YYYY-MM-DD" }).withMessage('Please enter valid date of birth.'),
            check('user_type').not().isEmpty().withMessage('Please provide user type.').bail().isIn([1, 2]).withMessage('Please provide valid user type.'),
            check('is_social_reg').trim().not().isEmpty().withMessage('Please provide is social registration.').bail().isIn([0, 1]).withMessage("Please provide valid is social registration value.").custom((value: number, { req }) => {
                if (value == 1) {  // 2 => Social Login 
                    if (!req.body.social_id || req.body.social_id.trim() == '') {
                        throw new Error("Please provide valid social id.")
                    } else if (req.body.social_id.length > 1000) {
                        throw new Error('The maximum length allowed is 1000 characters.');
                    }
                    if (!req.body.social_token || req.body.social_token.trim() == '') {
                        throw new Error('Please provide social token.');
                    } else if (req.body.social_token.length > 1000) {
                        throw new Error('The maximum length allowed is 1000 characters.');
                    }
                    if (!req.body.social_type || req.body.social_type == '') {
                        throw new Error('Please provide social type.');
                    } else {
                        if (req.body.social_type != 1 && req.body.social_type != 2 && req.body.social_type != 3) {
                            throw new Error('Please provide valid social type.');
                        }
                    }
                } else {
                    if (req.body.password == "") {
                        throw new Error('Please provide password.');
                    } else if (req.body.password.length > 50) {
                        throw new Error('The maximum length allowed for password is 50 characters.');
                    }
                }
                return true;
            }),
            check('is_verified').trim().not().isEmpty().withMessage('Please provide value for is verified').isIn([0, 1]).withMessage('Please provide valid for is verified').custom((value, { req }) => {
                if (value == 1) { // EMAIL IS VERIFIED
                    let device_os_type = req.body.device_os_type;

                    if (!device_os_type || ![1, 2, 3].includes(device_os_type)) {
                        throw new Error('Please provide a valid device OS type.');
                    }

                    if (device_os_type == 1 || device_os_type == 2) { // 1 => Android, 2 => iOS 
                        if (!req.body.app_version || req.body.app_version.trim() == '') {
                            throw new Error('Please provide app version.');
                        } else if (req.body.app_version.length > 10) {
                            throw new Error('The maximum length allowed is 10 characters.');
                        }
                        if (!req.body.device_uid || req.body.device_uid.trim() == '') {
                            throw new Error('Please provide device uid.');
                        } else if (req.body.device_uid.length > 50) {
                            throw new Error('The maximum length allowed is 50 characters.');
                        }
                        if (!req.body.device_token || req.body.device_token.trim() == '') {
                            throw new Error('Please provide device token.');
                        } else if (req.body.device_token.length > 200) {
                            throw new Error('The maximum length allowed is 200 characters.');
                        }
                        if (!req.body.device_name || req.body.device_name.trim() == '') {
                            throw new Error('Please provide device name.');
                        } else if (req.body.device_name.length > 50) {
                            throw new Error('The maximum length allowed is 50 characters.');
                        }
                        if (!req.body.device_model || req.body.device_model.trim() == '') {
                            throw new Error('Please provide device model.');
                        } else if (req.body.device_model.length > 20) {
                            throw new Error('The maximum length allowed is 20 characters.');
                        }
                        if (!req.body.device_version || req.body.device_version.trim() == '') {
                            throw new Error('Please provide device version.');
                        } else if (req.body.device_version.length > 10) {
                            throw new Error('The maximum length allowed is 10 characters.');
                        }
                    } else if (device_os_type == 3) { // 3 => Web
                        if (!req.body.browser_id || req.body.browser_id.trim() == '') {
                            throw new Error('Please provide browser id.');
                        } else if (req.body.browser_id.length > 250) {
                            throw new Error('The maximum length allowed is 250 characters.');
                        }
                        if (!req.body.browser_version || req.body.browser_version.trim() == '') {
                            throw new Error('Please provide browser version.');
                        } else if (req.body.browser_version.length > 50) {
                            throw new Error('The maximum length allowed is 50 characters.');
                        }
                        if (!req.body.session_id || req.body.session_id.trim() == '') {
                            throw new Error('Please provide session id.');
                        } else if (req.body.session_id.length > 250) {
                            throw new Error('The maximum length allowed is 250 characters.');
                        }
                        if (!req.body.browser_name || req.body.browser_name.trim() == '') {
                            throw new Error('Please provide browser name.');
                        } else if (req.body.browser_name.length > 80) {
                            throw new Error('The maximum length allowed is 80 characters.');
                        }
                    }
                }
                return true;
            }),
            check('answers_data').not().isEmpty().withMessage("Please provide answers data.").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please provide answers data.')
                }
                if (value.length < 1) {
                    throw new Error('Please provide answers data.')
                }
                return true;
            }),
            check('answers_data.*.questionnaire_id').not().isEmpty().withMessage("Please provide questionnaire id.").isInt({ min: 1 }).withMessage("Please provide minimum 1 in questionnaire id."),
            check('answers_data.*.answers').not().isEmpty().withMessage("Please provide answers.").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please provide answers.')
                }
                if (value.length < 1) {
                    throw new Error('Please provide answers.');
                }
                return true;
            }),
            check('answers_data.*.answers.*.q_id').not().isEmpty().withMessage("Please provide q id.").isInt({ min: 1 }).withMessage("Please provide minimum 1 in q id."),
            check('answers_data.*.answers.*.sel_opt_id').not().isEmpty().withMessage("Please select a option").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please select a valid option.');
                }

                for (let i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                        throw new Error("Please provide numeric value in option id")
                    }
                }
                return true;
            }),
            check('sel_opt_text').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).withMessage("The maximum length allowed is 255 characters.").bail().matches(Validator.common_regex).withMessage('You have entered an invalid option text.')
        ];
    }

    verifyOtpValidation(): object {
        return [
            check('otp').trim().not().isEmpty().withMessage('Please provide the OTP.'),
            check('email').trim().toLowerCase().not().isEmpty().withMessage('Please enter email address.').bail().isEmail().withMessage('Please enter valid Email address.'),
            check('otp_for').not().isEmpty().withMessage('Please provide otp for.').bail().isIn([1, 2]).withMessage('Please provide valid otp for.')        
        ];
    }

    sendOtpValidation(): object {
        return [
            check('otp_for').not().isEmpty().withMessage('Please provide otp for.').bail().isIn([1, 2]).withMessage('Please provide valid otp for.'),
            check('email').trim().toLowerCase().not().isEmpty().withMessage('Please enter email address.').bail().isEmail().withMessage('Please enter valid Email address.'),
            check('is_resend').not().isEmpty().withMessage('Please provide is resend.').bail().isIn([0, 1]).withMessage('Please provide valid is resend.')
        ];
    }

    forgotPasswordValidation(): object {
        return [
            check('email').trim().toLowerCase().not().isEmpty().withMessage('Please enter email address.').bail().isEmail().withMessage('Please enter valid Email address.'),
            check('otp').trim().not().isEmpty().withMessage('Please provide otp.').bail().matches(Validator.common_regex).withMessage('You have entered an invalid OTP.').matches(/^\d{4}$/).withMessage('You have entered an invalid OTP.'),
            check('new_password').trim().not().isEmpty().withMessage('Please provide password.').bail().isLength({ min: 1, max: 50 }).withMessage("The maximum length allowed is 50 characters."),
        ];
    }

    changePasswordValidation(): object {
        return [
            check('old_password').trim().not().isEmpty().withMessage('Please provide old password.').bail().isLength({ min: 1, max: 50 }).withMessage("The maximum length allowed is 50 characters."),
            check('new_password').trim().not().isEmpty().withMessage('Please provide new password.').bail().isLength({ min: 1, max: 50 }).withMessage("The maximum length allowed is 50 characters."),
        ];
    }

    updateUserProfileValidation(): object {
        return [
            check('user_first_name').optional({ checkFalsy: true }).isString().isLength({ min: 1, max: 255 }).withMessage("The maximum length allowed is 255 characters.").bail().matches(Validator.common_regex).withMessage('You have entered an invalid user full name.').custom(value => {
                if (!isNaN(value)) {
                    throw new Error('You have entered an invalid user full name.');
                }
                return true;
            }),
            check('phone_number').optional({ checkFalsy: true }).matches(Validator.phone_regex).withMessage('Please enter valid phone number.').bail().isLength({ min: 1, max: Validator.max_phone_length }).withMessage(`The maximum length allowed is ${Validator.max_phone_length} characters.`),
            check('gender').optional({ checkFalsy: true }).isIn([0, 1, 2]).withMessage('Please provide valid gender.'),
            check('country').optional({ checkFalsy: true }).isString().isLength({ min: 1, max: 30 }).withMessage("The maximum length allowed is 30 characters.").bail().matches(Validator.common_regex).withMessage('Please provide valid country.'),
            check('city').optional({ checkFalsy: true }).isString().isLength({ min: 1, max: 30 }).withMessage("The maximum length allowed is 30 characters.").bail().matches(Validator.common_regex).withMessage('Please provide valid city.'),
            check('zipcode').optional({ checkFalsy: true }).bail().isString().isLength({ min: 1, max: 20 }).withMessage("The maximum length allowed is 20 characters.").bail().matches(Validator.common_regex).withMessage('Please provide valid zipcode.'),
            check('dob').optional({ checkFalsy: true }).isDate({ format: "YYYY-MM-DD" }).withMessage('Please enter valid date of birth.'),
            check('height').optional({ checkFalsy: true }).isInt({ min: 40, max: 300 }).withMessage('Please provide valid height.'),
            check('current_password').optional({ checkFalsy: true }).isLength({ min: 1, max: 50 }).withMessage("The maximum length allowed is 50 characters."),
            check('new_password').optional({ checkFalsy: true }).isLength({ min: 1, max: 50 }).withMessage("The maximum length allowed is 50 characters.").custom((value, { req }) => {
                if (value == req.body.confirm_password) {
                    return true;
                } else {
                    throw new Error('Password and confirm password should be same.');
                }
            }),
            check('introduction').optional({ checkFalsy: true}).isString().withMessage("Please provide string value in introduction."),
            check('university').optional({ checkFalsy: true}).isString().withMessage("Please provide string value in university."),
            check('political_view').optional({ checkFalsy: true}).isString().withMessage("Please provide string value in political view.")
        ];
    }

    checkSocialLoginExistsValidation(): object {
        return [
            check('social_id').trim().not().isEmpty().withMessage('Please provide social id.')
        ]
    }

    logoutValidation(): object {
        return [
            check('device_uid').trim().not().isEmpty().withMessage('Please provide device uid.')
        ]
    }

    saveAnswerValidation(): object {
        return [
            check('answers_data').not().isEmpty().withMessage("Please provide answers data.").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please provide answers data.')
                }
                if (value.length < 1) {
                    throw new Error('Please provide answers data.')
                }
                return true;
            }),
            check('answers_data.*.questionnaire_id').not().isEmpty().withMessage("Please provide questionnaire id.").isInt({ min: 1 }).withMessage("Please provide minimum 1 in questionnaire id."),
            check('answers_data.*.answers').not().isEmpty().withMessage("Please provide answers.").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please provide answers.')
                }
                if (value.length < 1) {
                    throw new Error('Please provide answers.');
                }
                return true;
            }),
            check('answers_data.*.answers.*.q_id').not().isEmpty().withMessage("Please provide q id.").isInt({ min: 1 }).withMessage("Please provide minimum 1 in q id."),
            check('answers_data.*.answers.*.field_name').not().isEmpty().withMessage("Please provide field name.").isString().withMessage("Please provide string value in field name."),
            check('answers_data.*.answers.*.sel_opt_id').not().isEmpty().withMessage("Please select a option").custom((value: any) => {
                if (!Array.isArray(value)) {
                    throw new Error('Please select a valid option.');
                }

                for (let i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                        throw new Error('Please provide numeric value in option id.');
                    }
                }
                return true;
            }),
            check('answers_data.*.answers.*.field_value').not().isEmpty().withMessage("Please provide field value.").custom((item : any)=>{
                if(!Array.isArray(item)){
                    throw new Error('Please provide array value in field value.');
                }
                
                for(let i = 0; i < item.length; i++){
                    if(typeof item[i] != "string"){
                        throw new Error('Please provide string value in field value');
                    }
                }
                return true;
            }),
            check('sel_opt_text').optional({ checkFalsy: true }).isString().isLength({ max: 255 }).withMessage("The maximum length allowed is 255 characters.").bail().matches(Validator.common_regex).withMessage('You have entered an invalid option text.')
        ]
    }

    getQuestionsValidation():object {
        return [
            check('questionnaire_type_id').optional({checkFalsy: true}).isInt({min:1}).withMessage("Please provide valid questionnaire type id")
        ]
    }

    getAnswersValidation():object {
        return [
            check('questionnaire_type_id').optional({checkFalsy: true}).isInt({min:1}).withMessage("Please provide valid questionnaire type id"),
            check('question_id').optional({checkFalsy: true}).isInt({min:1}).withMessage("Please provide valid question id")
        ]
    }

    profileImagesValidatiion(): object {
        return [
            check('upload_files').optional({ checkFalsy: true }).isArray().withMessage('Please provide valid image').custom((value) => {
                if (Array.isArray(value) && value.length > 0) {
                    for (let files of value) {
                        if (files.originalFilename != "") {
                            files.originalFilename = global.Helpers.checkFileNameLength(files.originalFilename);
                            let fileNameArrLength = files.originalFilename.split('.').length;
                            let fileExtnsn = files.originalFilename.split('.')[fileNameArrLength - 1];

                            if (!FILE_CONFIG.profile_image_extension.includes(fileExtnsn)) {
                                throw new Error(`Image extension should be ${FILE_CONFIG.profile_image_extension_response}.`);
                            }
                        } else {
                            throw new Error('Please provide image');
                        }
                    }
                } else {
                    throw new Error('Please provide valid image')
                }
                return true;
            }),
            check('set_dp_pos').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage("Please provide valid set dp position")
        ]
    }
    deletProfileImageValidation(): object {
        return [
            check('delete_position')
                .isArray().withMessage('Delete position must be an array.')
                .bail()
                .custom((value) => {
                    if (value.length === 0) {
                        throw new Error('Delete position must have at least one element.'); // throw error if the array is empty
                    }
                    return true; // Continue to next validation
                })
                .bail()
                .custom((value: number[]) => value.every((item: number) => typeof item === 'number'))
                .withMessage('All elements inside Delete position must be number.')
        ]
    }

    checkUniqueIdExistsValidation(): object {
        return [
            check('unique_id').trim().not().isEmpty().withMessage('Please provide unique id.').isString().withMessage("Please provide string value in unique id")
        ]
    }

    comparePoseValidation(): object {
        return [
            check('uploaded_file').isArray().withMessage('Please provide valid image').custom((value) => {
                if (Array.isArray(value) && value.length > 0) {
                    if (value[0].originalFilename != "") {
                        value[0].originalFilename = global.Helpers.checkFileNameLength(value[0].originalFilename);
                        let fileNameArrLength = value[0].originalFilename.split('.').length;
                        let fileExtnsn = value[0].originalFilename.split('.')[fileNameArrLength - 1];

                        if (!FILE_CONFIG.profile_image_extension.includes(fileExtnsn)) {
                            throw new Error(`Image extension should be ${FILE_CONFIG.profile_image_extension_response}.`);
                        }
                    } else {
                        throw new Error('Please provide image');
                    }
                } else {
                    throw new Error('Please provide valid image')
                }
                return true;
            }),
            check('match_pose').trim().not().isEmpty().withMessage("Please provide valid match pose").isURL().withMessage("Please provide valid match pose")
        ]
    }
}
