import { statusBuild } from "./common_interface";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import multiparty from "multiparty";
import { JWTHelper } from "../helper/jwt_helper";
import * as jwt from 'jsonwebtoken'

export class common_middleware {
    private api_var: {
        'version': string,
        'developer': string
    };
    constructor() {

        this.api_var = {
            'version': process.env.VERSION as string,
            'developer': process.env.API_DEVELOPER as string
        }

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public validateFormData = async (req: Request, res: Response<{}>, next: NextFunction): Promise<void> => {
        let checkMultiparty: number = 0
        if (Object.keys(req.body).length == 0) {
            //ONLY LOGIN DETAILS EXIST
            checkMultiparty = 1;
        }

        if (checkMultiparty == 1) {
            let checkform = (callback: any) => {
                let sendData: { [key: string]: object } = {};
                let form = new multiparty.Form();
                form.parse(req, function (err: Error | null, fields: { [key: string]: any }, files: { [key: string]: any }) {
                    if (typeof (fields) != 'undefined') {
                        if (Object.keys(fields).length > 0) {
                            Object.keys(fields).forEach(function (key: string) {
                                sendData[key] = fields[key][0];
                            });
                        }
                    }
                    else {
                        global.Helpers.notAcceptableStatusBuild(res, 'Content type mismatch');
                        return;
                    }

                    if (typeof (files) != 'undefined') {
                        if (Object.keys(files).length > 0) {
                            Object.keys(files).forEach(function (key: string) {
                                sendData[key] = files[key];
                            });
                        }
                    }
                    else {
                        global.Helpers.notAcceptableStatusBuild(res, 'Content type mismatch');
                        return;
                    }
                    callback(sendData);
                });
            }
            let callbackfun = (sendData: { [key: string]: any }) => {
                req.body = sendData;
                next();
            }
            checkform(callbackfun);
        }
        else {
            next();
        }
    }
    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public checkforerrors = async (req: object, res: statusBuild, next: NextFunction): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            let response_status: { [key: string]: any } = {};
            let response_dataset = {};
            let response_data: { [key: string]: any } = {};
            let errorVal = errors.array();
            response_dataset = errors.array();
            response_status.msg = errorVal[0].msg.toLowerCase();
            response_status.msg = response_status.msg.charAt(0).toUpperCase() + response_status.msg.slice(1);

            response_status.action_status = false;
            response_data.data = response_dataset;
            response_data.status = response_status;
            response_data.publish = this.api_var;

            if (errorVal[0].msg == 'Please update your app.') {
                res.status(401);
            } else {
                res.status(400);
            }
            res.send({ response: response_data });
        } else {
            next();
        }
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Token validation
    */

    public validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let token = req.headers['authorization'];
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            let validToken = new JWTHelper();
            // decode token
            if (token) {
                validToken.verifyToken(token)
                    .then(async jwtDecres => {
                        req.body.loginDetails = jwtDecres;
                        next()
                    }).catch(async err => {
                        global.Helpers.unauthorizedStatusBuild(res, 'Due to innactivity you have been logged out.');
                    });
            } else {
                global.Helpers.unauthorizedStatusBuild(res, 'Token Undefined');
            }
        } else {
            global.Helpers.unauthorizedStatusBuild(res, 'Due to innactivity you have been logged out.');
        }
    }

    validateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
        let token = req.body.refresh_token;
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            token = await global.Helpers.tokenDecrypt(token);

            // decode token
            if (token) {
                this.verifyRefreshToken(token)
                    .then(async (jwtDecres: any) => {
                        req.body.refToken_loginDetails = jwtDecres.param;
                        next();
                    }).catch(async err => {
                        global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
                    });
            } else {
                global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
            }
        } else {
            global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
        }
    }

    validateExpiredToken = async (req: Request, res: Response, next: NextFunction) => {
        let token: string = req.headers['authorization'] as string;
        if (token) {
            if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
                token = await global.Helpers.tokenDecrypt(token);
            }

            // decode token
            if (token) {
                this.ExpverifyToken(token)
                    .then(async jwtDecres => {
                        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
                        if ((Math.floor((new Date).getTime() / 1000)) >= expiry) {
                            const ca = token as string;
                            const base64Url = ca.split('.')[1];
                            const decodedValue = JSON.parse(atob(base64Url));
                            req.body.expired_loginDetails = decodedValue;
                            next();
                        } else if ((Math.floor((new Date).getTime() / 1000)) < expiry) {
                            req.body.valid_loginDetails = jwtDecres;
                            next();
                        }
                    }).catch(async err => {
                        global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
                    });
            } else {
                global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
            }
        } else {
            global.Helpers.unauthorizedStatusBuild(res, 'Invalid Token. Access Forbidden.');
        }
    }

    verifyRefreshToken(token: string) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, process.env.REFRESH_TOKEN_KEY as string, process.env.JWT_ALGORITHM as any, function (err, result) {
                if (result)
                    return resolve(result);
                else
                    return reject(err);
            });
        });
    }
    // For Expired Token Verify
    ExpverifyToken(token: string) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, process.env.JWT_SECRET as string, process.env.JWT_ALGORITHM as any, function (err: any, result) {
                if (result)
                    return resolve(result);
                else
                    if (err?.message == "jwt expired") {
                        return resolve(token);
                    } else {
                        return reject(err);
                    }

            });
        });

    }
    // For from data decryption
    public decryptFromdata = async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.enc_data) {
            if (req.headers['content-type'] == 'application/json') {
                if (process.env.ENCRYPTED_DATA == '1') {
                    req.body = JSON.parse(await global.encrypt_decrypt_helper.decryptRequest(req.body.enc_data)) || {};
                }
            }
        }
        next();
    }
    //End
}