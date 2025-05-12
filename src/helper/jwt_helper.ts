import * as jwt from "jsonwebtoken";
import crypto, { CipherKey, CipherMode } from 'crypto';

export class JWTHelper {

	constructor() { }

	/**
	 * @developer : Aditi Pal
	 * @date : 26-07-2023
	 * @description : Token creation
	*/
	public createToken = (tokenDetails: object): Promise<any> => {
		const that = this;

		return new Promise((resolve, reject) => {
			// Use an IIFE to handle async operations
			(async () => {
				try {
					const algorithm: any = process.env.JWT_ALGORITHM;

					/* Access token generation */
					const accessTokenCreate = jwt.sign(tokenDetails, process.env.JWT_SECRET as string, {
						algorithm: algorithm,
						expiresIn: process.env.JWT_EXPIRES as string | undefined,
					});

					const expiresIn: string = process.env.JWT_EXPIRES || "0s";

					const current_unix_timestamp = Math.floor(Date.now() / 1000);
					const acces_token_expired = current_unix_timestamp + parseInt(expiresIn.replace("s", ""));

					const accessToken: string = (await that.encryptMe(accessTokenCreate)) as string;
					/* End */

					/* Refresh token generation */
					const refreshTokenCreate = jwt.sign(tokenDetails, process.env.REFRESH_TOKEN_KEY as string, {
						algorithm: algorithm,
						expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
					});

					const expiresat: string = process.env.REFRESH_TOKEN_EXPIRE || "0s";
					const refresh_token_expired = current_unix_timestamp + parseInt(expiresat.replace("s", ""));

					const refreshToken: string = (await that.encryptMe(refreshTokenCreate)) as string;
					/* End */

					const response = {
						error: false,
						message: "Token created successfully.",
						accessToken: accessToken,
						acces_token_expired: acces_token_expired,
						refreshToken: refreshToken,
						refresh_token_expired: refresh_token_expired,
					};

					resolve(response); // Resolve the promise with the response
				} catch (error: any) {
					reject({
						error: true,
						message: error.message,
					}); // Reject the promise in case of error
				}
			})(); // Invoke the async function immediately
		});
	};


	/**
	 * @developer : Aditi Pal
	 * @date : 26-07-2023
	 * @description : Token verification
	*/
	verifyToken = async (token: string) => {

		/*Decrypt the token*/
		const tokenDecrypted: any = await this.decryptMe(token);
		const that = this;
		return new Promise(function (resolve, reject) {
			const algorithm: any = process.env.JWT_ALGORITHM;

			jwt.verify(tokenDecrypted, process.env.JWT_SECRET as string, algorithm, async (err: any, data: any) => {
				if (err) {
					return reject({ error: true, message: 'Unable to verified token.', errorstack: err });
				} else {
					return resolve({ error: false, message: 'Token verified successfully.', verifiedData: data });
				}
			});

		});
	}

	/**
	 * @developer : Aditi Pal
	 * @date : 26-07-2023
	 * @description : Token encryption
	*/
	encryptMe = async (val: string) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			(async () => {
				try {
					const secretKey: CipherKey = process.env.JWT_SECRET as CipherKey;
					const ivKey: CipherMode = process.env.ENCRYPTION_IV_KEY as CipherMode;
					let cipher = crypto.createCipheriv('aes-256-cbc', secretKey, ivKey);
					let encrypted = cipher.update(val, 'utf8', 'base64');
					encrypted += cipher.final('base64');
					return resolve(encrypted);
				} catch (e) {
					return reject(e)
				}
			})();
		});
	}

	/**
	 * @developer : Aditi Pal
	 * @date : 26-07-2023
	 * @description : Token decryption
	*/
	decryptMe = async (encrypted: string) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			(async () => {
				try {
					const secretKey: CipherKey = process.env.JWT_SECRET as CipherKey;
					const ivKey: CipherMode = process.env.ENCRYPTION_IV_KEY as CipherMode;
					let decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, ivKey);
					let decrypted = decipher.update(encrypted, 'base64', 'utf8');
					return resolve(decrypted + decipher.final('utf8'));
				} catch (e) {
					return reject(e)
				}
			})();
		});
	}

	/**
	 * @developer : Aditi Pal
	 * @date : 26-07-2023
	 * @description : Regenarate token
	*/
	regenerateToken = async (param: any) => {
		const that = this;
		return new Promise(function (resolve, reject) {
			(async () => {
				try {
					const refreshTokenOldDecrypted: any = await that.decryptMe(param.param.refreshTokenOld);
					const accessTokenOldDecrypted: any = await that.decryptMe(param.param.accessTokenOld);
					/*If unable to RSA decrypt*/
					if (!refreshTokenOldDecrypted || !accessTokenOldDecrypted) {
						return resolve(false);
					}
					/*End*/

					let generateTokenFlag = false;
					const algorithm: any = process.env.JWT_ALGORITHM;
					/*Verify access token*/
					jwt.verify(accessTokenOldDecrypted, process.env.JWT_SECRET as string, algorithm, function (err: any, result) {
						if (result) {
							generateTokenFlag = true;
						} else {
							if (err.name == 'TokenExpiredError') { /*Token is valid but expired*/
								generateTokenFlag = true;
							} else {
								return resolve(false);
							}
						}
						/*End*/

						/*Verify refresh token*/
						jwt.verify(refreshTokenOldDecrypted, process.env.REFRESH_TOKEN_KEY as string, algorithm, function (err, result: any) {
							(async () => {
								if (result) {
									generateTokenFlag = true;
								} else {
									return resolve(false);
								}
								try {
									if (generateTokenFlag) {
										const tokenResult = await that.createToken({ param: result.param });
										return resolve(tokenResult)
										/*End*/
									}
								} catch (e) {
									return reject(e)
								}
							})();
						});
						/*End*/
					});
				} catch (e) {
					return reject(e)
				}
			})();
		});
	}
}