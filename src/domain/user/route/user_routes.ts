import express from 'express';
import { Request, Response, NextFunction } from "express";
const router = express.Router();

const methodNotAllowed = (req: Request, res: Response, next: NextFunction) => global.Helpers.methodNotAllowedStatusBuild(res, 'Method not allowed');

import { common_middleware } from '../../../helper/common_middleware';
import { UserMiddleware } from '../middleware/user_middleware';

const userMiddleware = new UserMiddleware();
const commonmiddleware = new common_middleware();

let middleware: any[] = [];

import { UserController } from '../controller/user_controller';
const userController = new UserController();


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.loginValidation(),
    commonmiddleware.checkforerrors
]
router.route('/login')
    .post(middleware, userController.generateAuthCode)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.generateTokenValidationRule(),
    commonmiddleware.checkforerrors
]
router.route("/generateToken")
    .post(middleware, userController.generateToken)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateRefreshToken,
    userMiddleware.regenrateTokenValidationRule(),
    commonmiddleware.checkforerrors
]
router.route('/regenerateToken')
    .post(middleware, userController.regenerateToken)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.userRegistrationValidation(),
    commonmiddleware.checkforerrors
]
router.route('/registration')
    .post(middleware, userController.userRegistration)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.verifyOtpValidation(),
    commonmiddleware.checkforerrors
]
router.route('/verifyOtp')
    .post(middleware, userController.verifyOtp)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.sendOtpValidation(),
    commonmiddleware.checkforerrors
]
router.route('/sendOtp')
    .post(middleware, userController.sendOtp)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.forgotPasswordValidation(),
    commonmiddleware.checkforerrors
]
router.route('/forgot_password')
    .post(middleware, userController.forgotPassword)
    .all(methodNotAllowed);


middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.changePasswordValidation(),
    commonmiddleware.checkforerrors
]
router.route('/change_password')
    .post(middleware, userController.changePassword)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.updateUserProfileValidation(),
    commonmiddleware.checkforerrors
]
router.route('/update')
    .post(middleware, userController.updateUserProfile)
    .all(methodNotAllowed);

middleware = [
    userMiddleware.checkSocialLoginExistsValidation(),
    commonmiddleware.checkforerrors
]
router.route('/checkSocialLoginExists')
    .post(middleware, userController.checkSocialLoginExists)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateToken,
    commonmiddleware.checkforerrors
]
router.route('/allNotificationsList')
    .post(middleware, userController.allNotificationsList)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateToken,
    commonmiddleware.checkforerrors
]
router.route('/unreadNotificationCount')
    .post(middleware, userController.unreadNotificationCount)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateToken,
    userMiddleware.logoutValidation(),
    commonmiddleware.checkforerrors
]
router.route('/logout')
    .post(middleware, userController.logout)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.saveAnswerValidation(),
    commonmiddleware.checkforerrors
]
router.route('/saveAnswers')
    .post(middleware, userController.saveAnswers)
    .all(methodNotAllowed);

middleware = []
router.route('/getCategories')
    .get(middleware, userController.getCategories)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    userMiddleware.getQuestionsValidation(),
    commonmiddleware.checkforerrors
]
router.route('/getQuestions')
    .post(middleware, userController.getQuestions)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.getAnswersValidation(),
    commonmiddleware.checkforerrors
]
router.route('/getAnswers')
    .post(middleware, userController.getAnswers)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.profileImagesValidatiion(),
    commonmiddleware.checkforerrors
]
router.route('/updateProfileImages')
    .post(middleware, userController.profileImages)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.deletProfileImageValidation(),
    commonmiddleware.checkforerrors
]
router.route('/deletProfileImage')
    .delete(middleware, userController.deletProfileImage)
    .all(methodNotAllowed);    

middleware = [
    commonmiddleware.validateToken,
    commonmiddleware.checkforerrors
]
router.route('/viewProfile')
    .get(middleware, userController.viewProfile)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.checkUniqueIdExistsValidation(),
    commonmiddleware.checkforerrors
]
router.route('/recommendedUserProfile')
    .post(middleware, userController.recommendedUserProfile)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.checkUniqueIdExistsValidation(),
    commonmiddleware.checkforerrors
]
router.route('/getProfile')
    .post(middleware, userController.getProfile)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateToken,
    commonmiddleware.checkforerrors
]
router.route('/getAllImages')
    .get(middleware, userController.getAllImages)
    .all(methodNotAllowed);

middleware = [
    commonmiddleware.validateFormData,
    commonmiddleware.validateToken,
    userMiddleware.comparePoseValidation(),
    commonmiddleware.checkforerrors
]
router.route('/comparePose')
    .post(middleware, userController.comparePose)
    .all(methodNotAllowed);

export const user_routing = router;