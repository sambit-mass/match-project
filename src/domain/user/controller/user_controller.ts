import { Request, Response } from "express";
import { UserService } from "../service/user_service";


export class UserController {
    private _userService = new UserService();

    initLog() {
        global.logs.logObj.file_name = "V1-UserController";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Generate Auth Code (Login API)
    */
    public generateAuthCode = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'generateAuthCode - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.generateAuthCode(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Generate Token
    */
    public generateToken = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'generateToken - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.generateTokenService(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Regenerate Token
    */
    public regenerateToken = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'regenerateToken - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            let reqBody = {
                refresh_token: req.body.refresh_token,
                token_params: req.body.refToken_loginDetails
            }
            const response: any = await this._userService.regeneratedTokenService(reqBody);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: User Registration
    */
    public userRegistration = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'userRegistration - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.userRegistration(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Verify OTP
    */
    public verifyOtp = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'verifyOtp - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.verifyOtp(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Send OTP
    */
    public sendOtp = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'sendOtp - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.sendOtp(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Forgot password
    */
    public forgotPassword = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'forgotPassword - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.forgotPassword(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Change Password
    */
    public changePassword = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'changePassword - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.changePassword(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Update User Profile ( TEAM LEAD / TEAM MEMBER )
    */
    public updateUserProfile = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'updateUserProfile - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.updateUserProfile(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Check social login ID exists or not
    */
    public checkSocialLoginExists = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'checkSocialLoginExists - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.checkSocialLoginExists(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Fetch all notification list by user
    */
    public allNotificationsList = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'allNotificationsList - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.allNotificationsList(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Get unread notifications count
    */
    public unreadNotificationCount = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'unreadNotificationCount - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.unreadNotificationCount(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Anjali Show
     * @Date: 17-03-2025
     * @Function: Logout
    */
    public logout = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'logout - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.logout(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }
    /**
     * @Developer: Chumki Chakraborty
     * @Date: 31-03-2025
     * @Function: get Categories
    */
    public getCategories = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getCategories - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.getCategories()
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }
    /**
     * @Developer: Chumki Chakraborty
     * @Date: 31-03-2025
     * @Function: get Questions
    */
    public getQuestions = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getQuestions - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.getQuestions(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }
    /**
     * @Developer: Chumki Chakraborty
     * @Date: 01-04-2025
     * @Function: profile Images
    */
    public profileImages = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'profileImages - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.profileImages(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }


    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 31-03-2025
     * @Function: Save Answer
    */
    public saveAnswers = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'saveAnswers - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);

        try {
            const response: any = await this._userService.saveAnswer(req.body);
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }
    /**
     * @Developer: Chumki Chakraborty
     * @Date: 02-04-2025
     * @Function: Delet Profile Image
    */
    public deletProfileImage = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'deletProfileImage - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.deletProfileImage(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });

            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 02-04-2025
     * @Function: get Answers
    */
     public getAnswers = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getAnswers - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.getAnswers(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 03-04-2025
     * @Function: view profile
    */
     public viewProfile = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'viewProfile - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.viewProfile(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 21-04-2025
     * @Function: recommended user profile
    */
    public recommendedUserProfile = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'recommendedUserProfile - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.recommendedUserProfile(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 22-04-2025
     * @Function: get profile
    */
    public getProfile = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getProfile - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.getProfile(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sattik Sarkar
     * @Date: 23-04-2025
     * @Function: get all images
    */
    public getAllImages = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'getAllImages - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.getAllImages(req.body)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

    /**
     * @Developer: Sumit Sil
     * @Date: 30-04-2025
     * @Function: Get Pose Compare
    */
    public comparePose = async (req: Request, res: Response) => {
        this.initLog();
        const apiname_with_trace_id: string = 'comparePose - ' + global.Helpers.getTraceID(req.body);
        global.logs.writelog(apiname_with_trace_id, ['Request : ', req.body]);
        try {
            const response: any = await this._userService.comparePose(req.body, req.headers['authorization'] as string)
            global.logs.writelog(apiname_with_trace_id, { "RESPONSE": response });
            if (response.status) {
                return global.Helpers.successStatusBuild(res, response.data_sets, response.status_message);
            } else {
                return global.Helpers.badRequestStatusBuild(res, response.status_message);
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error, 'ERROR');
            return global.Helpers.badRequestStatusBuild(res, 'Something went wrong, please try again later.');
        }
    }

}
