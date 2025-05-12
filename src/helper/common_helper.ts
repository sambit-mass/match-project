import moment from "moment-timezone";
import sharp from "sharp";
import {
	statusBuild,
	response_object_detail,
	methodNotAllowed,
} from "./common_interface";
import { helperConfig } from "./helper_config";
import Cryptr from "cryptr";
import argon2 from 'argon2';
import { JWTHelper } from './jwt_helper';
import { FILE_CONFIG } from "../domain/file/file_config";
import axios from 'axios';
import { gRPCMailServer } from "../grpc_client";
import mongoose from "mongoose";
import { USER_CONFIGS } from "../domain/user/user_config";

export class common_helper {
	private api_var: {
		'version': string,
		'developer': string
	};
	constructor() {
		this.api_var = {
			'version': process.env.VERSION as string,
			'developer': process.env.API_DEVELOPER as string
		};
	}

	initLog() {
		global.logs.logObj.file_name = "V1-CommonHelper";
		global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
	}

	public getCurrentISTDate(): string {
		let utc = Date.now() / 1000;
		return moment.unix(utc).tz(process.env.TZ as string).format('YYYY-MM-DD');
	}

	public getCurrentISTDateTime(): string {
		let utc = Date.now() / 1000;
		return moment.unix(utc).tz(process.env.TZ as string).format('YYYY-MM-DD HH:mm:ss');
	}

	convertHoursToDaysAndHours(hours: number) {
		// CALCULATE THE NUMBER OF WHOLE DAYS
		const days = Math.floor(hours / 24);

		// CALCULATE THE REMAINING HOURS AFTER REMOVING WHOLE DAYS
		const remainingHours = hours % 24;

		return { days, remainingHours }
	}

	public successStatusBuild(res: statusBuild, dataset: object, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: true
		};
		if (process.env.ENCRYPTED_DATA == '1') {
			dataset = {
				enc_data: global.encrypt_decrypt_helper.encryptApiFullResponse(JSON.stringify(dataset))
			}
		}
		let response_data: response_object_detail = {
			data: dataset,
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_OK);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public capitalizeFirstLetter(object: { [key: string]: any }): object {
		// ENSURE THE 'MSG' IS CONVERTED TO LOWERCASE WHILE PRESERVING "OTP"
		object.status.msg = object.status.msg.toLowerCase().replace(/\b(otp)\b/gi, 'OTP'); // Replace all occurrences of "otp" with "OTP"

		// CAPITALIZE THE FIRST LETTER OF THE MESSAGE AND AFTER EVERY FULL STOP
		object.status.msg = object.status.msg.replace(/(^\w|[.!] \w)/g, (match: any) => match.toUpperCase());
		return object
	}

	public badRequestStatusBuild(res: statusBuild, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
			publish: this.api_var
		};

		res.status(helperConfig.HTTP_RESPONSE_BAD_REQUEST);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public methodNotAllowedStatusBuild(res: methodNotAllowed, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
			publish: this.api_var

		};

		res.setHeader('content-type', 'application/json');
		res.status(helperConfig.HTTP_RESPONSE_METHOD_NOT_ALLOWED);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public notAcceptableStatusBuild(res: statusBuild, msg: string): void {
		let response_status: { [key: string]: any } = {};
		let response_dataset: object[] = [];
		let response_data: { [key: string]: any } = {};
		response_status.msg = msg;
		response_status.action_status = false;
		response_data.data = response_dataset;
		response_data.status = response_status;
		response_data.publish = this.api_var;
		res.status(helperConfig.HTTP_RESPONSE_NOT_ACCEPTABLE);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

	public unauthorizedStatusBuild(res: statusBuild, msg: string) {
		let response_status: { [key: string]: any } = {};
		let response_dataset: { [key: string]: any } = [];
		let response_data: { [key: string]: any } = {};
		response_status.msg = msg;
		response_status.action_status = false;
		response_data.data = response_dataset;
		response_data.status = response_status;
		response_data.publish = this.api_var;
		res.status(helperConfig.HTTP_RESPONSE_UNAUTHORIZED);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}
	makeUnauthorizedServiceStatus = (msg: string) => {
		let make_status_obj = {
			status: false,
			status_code: global.helper_config.HTTP_RESPONSE_UNAUTHORIZED,
			status_message: msg
		};
		return make_status_obj;
	}

	getTraceID(reqbody: { [key: string]: any }) {
		if (reqbody.hasOwnProperty("loginDetails") && reqbody.loginDetails.hasOwnProperty("id")) {
			return ' - ' + reqbody.loginDetails.id;
		} else {
			return '';
		}
	}

	encryptId(id: string) {
		let cryptr = new Cryptr('1');
		const encryptedId = cryptr.encrypt(id);
		return encryptedId;
	}

	decryptId(id: string) {
		let cryptr = new Cryptr('1');
		const decryptedId = cryptr.decrypt(id);
		return decryptedId;
	}

	encryptObject(data: string) {
		let cryptr = new Cryptr('1');
		const encryptedId = cryptr.encrypt(data);
		return encryptedId;
	}

	decryptObj(id: string) {
		let cryptr = new Cryptr('1');
		const decryptedId = cryptr.decrypt(id);
		return decryptedId;
	}

	async hashPassword(passsword: string) {
		let hash = await argon2.hash(passsword);
		return hash;
	}

	async comparePassword(password: string, hash: string) {
		if (await argon2.verify(hash, password)) {
			return true;
		} else {
			return false;
		}
	}

	getDateTimeOnlyWithFormat(date: string | Date, format_type: string) {
		if (!date) {
			return null;
		}
		const currDate = new Date(date);
		const dateNew = moment.utc(currDate).tz(process.env.TZ as string).format(format_type);
		return dateNew
	}

	async tokenDecrypt(encrypted: string) {
		let decryptOriginalToken = new JWTHelper();
		let token = await decryptOriginalToken.decryptMe(encrypted)
		return token as string;
	}

	randomNumberSixDig() {
		const ranNum = Math.floor(100000 + Math.random() * 900000);
		return ranNum;
	}

	validEmail(email: string) {
		const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([A-Za-zÃÁÂÀÄÇÉÈÊËÍÌÎÏÕÒÔÓÖÛÚÙÜãáàâäçéèêëíìîïñõôóòöûúùü\-0-9]+\.)+[A-Za-zÃÁÂÀÄÇÉÈÊËÍÌÎÏÕÒÔÓÖÛÚÙÜãáàâäçéèêëíìîïñõôóòöûúùü]{2,}))$/;
		return emailPattern.test(String(email).toLowerCase());
	}

	validPhoneNumber(phone: string) {
		const phonePattern = /^[0-9]{8,12}$/;
		return phonePattern.test(phone.replace(/\s+/g, ''));
	}

	validPhoneNumberForNonInd(phone: string) {
		const phonePattern = /^[0-9]{4,16}$/;
		return phonePattern.test(phone.replace(/\s+/g, ''));
	}

	validPinCode(pin: string) {
		const pinPattern = /^[0-9]{6,6}$/;
		return pinPattern.test(pin.replace(/\s+/g, ''));
	}

	validPinCodeForNonInd(pin: string) {
		const pinPattern = /^[A-Za-z0-9-]{1,12}$/;
		return pinPattern.test(pin.replace(/\s+/g, ''));
	}

	calculateAge(dob: string): number {
		const birthDate = new Date(dob);
		const today = new Date();

		return today.getFullYear() - birthDate.getFullYear() - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
	}

	TokenExpiryDate(token_time: string) {
		let exp_time = token_time.substring(0, token_time.length - 1)
		const date = new Date();
		const dateNew = moment.utc(date).tz(process.env.TZ as string).add(exp_time, 'second').format('YYYY-MM-DD HH:mm:ss');
		return dateNew
	}

	makeSuccessServiceStatus = (msg: string, data: object) => {
		let make_status_obj = {
			status: true,
			status_code: global.helper_config.HTTP_RESPONSE_OK,
			data_sets: data,
			status_message: msg
		};
		return make_status_obj;
	}

	makeBadServiceStatus = (msg: string) => {
		let make_status_obj = {
			status: false,
			status_code: global.helper_config.HTTP_RESPONSE_BAD_REQUEST,
			data_sets: {},
			status_message: msg
		};
		return make_status_obj;
	}

	makeBadRequestServiceStatus = (data: object) => {
		let make_status_obj = {
			status: false,
			status_code: global.helper_config.HTTP_RESPONSE_BAD_REQUEST,
			data_sets: { data },
			status_message: ""
		};
		return make_status_obj;
	}

	getCurrentTimestampUTCunix(): number {
		const utc = Math.floor(Date.now() / 1000)
		return utc;
	}

	public checkWhiteSpaceNullBlank(checkStr: string): boolean {
		if (checkStr === null) {
			return false;
		} else if (typeof checkStr === 'string') {
			if (checkStr.trim() == "") {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}

	public startsWith(value: string): string {
		return value.trim() + "%";
	}

	public contains(value: string): string {
		return "%" + value.trim() + "%";
	}

	public notContains(value: string): string {
		return "%" + value.trim() + "%";
	}

	public endsWith(value: string): string {
		return "%" + value.trim();
	}

	public equals(value: string): string {
		return value.trim();
	}

	public notEquals(value: string): string {
		return value.trim();
	}

	public globalFilter(value: string | number): string {
		if (typeof value === 'string') {
			return "%" + value.trim() + "%";
		}
		else {
			return "%" + value + "%";
		}
	}

	public mongoStartsWith(value: string): object {
		return { $regex: `^${value.trim()}`, $options: "i" };
	}

	public mongoContains(value: string): object {
		return { $regex: `${value.trim()}`, $options: "i" };
	}

	public mongoNotContains(value: string): object {
		return { $not: { $regex: `${value.trim()}`, $options: "i" } };
	}

	public mongoEndsWith(value: string): object {
		return { $regex: `${value.trim()}$`, $options: "i" };
	}

	public mongoEquals(value: string): object {
		return { $regex: `^${value.trim()}$`, $options: "i" };
	}

	public mongoNotEquals(value: string): object {
		return { $not: { $regex: `^${value.trim()}$`, $options: "i" } };
	}

	public mongoGlobalFilter(value: string | number): object {
		if (typeof value === "string") {
			return { $regex: `${value.trim()}`, $options: "i" };
		} else {
			return { $regex: `${value}`, $options: "i" };
		}
	}

	generateRandomNumberByLength(length: number) {
		let randomNumber = Math.floor(Math.random() * 9 + 1).toString(); // First digit will be between 1 and 9

		while (randomNumber.length < length) {
			const digit = Math.floor(Math.random() * 10); // Generates a digit between 0 and 9
			randomNumber += digit.toString();
		}

		return randomNumber;
	}

	checkFileNameLength = (file_name: string) => {
		this.initLog();
		const apiname_with_trace_id: string = "checkFileNameLength" + global.Helpers.getTraceID({});
		global.logs.writelog(apiname_with_trace_id, ["checkFileNameLength_Request : ", { file_name }]);
		try {
			if (file_name && file_name.length > FILE_CONFIG.max_file_name) {
				let totalFileName: any = file_name.split('.')
				let fileExtension = totalFileName[1];
				file_name = `fusion_matrix_${this.randomNumberSixDig()}.${fileExtension}`;
			}
			return file_name;
		} catch (error: any) {
			global.logs.writelog(apiname_with_trace_id, error.stack, "ERROR");
			return file_name;
		}
	}

	public getTimeDiffenceWithTargetTime(targetTime: string): number {
		// GET THE CURRENT DATE AND TIME USING MOMENT.JS
		let currentDateTime: any = moment.utc();
		// SPECIFY THE TARGET DATE AND TIME USING MOMENT.JS
		let otpCreatedAt: any = moment.utc(new Date(targetTime));

		// Calculate difference in seconds
		const diffInSeconds = currentDateTime.diff(otpCreatedAt, 'seconds');

		return diffInSeconds;
	}

	public tokenWithoutBearerText(token: string): string {
		if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
			// Remove Bearer from string
			token = token.slice(7, token.length);
		}
		return token
	}

	callOtherMicroServices = (data_array: any, base_url: string, api_url: string, data_headers = { 'content-type': 'application/json' }) => {
		return new Promise((resolve, reject) => {
			// Use an IIFE to handle async operations
			(async () => {
				try {
					const response = await axios.post(base_url + api_url, data_array, {
						headers: data_headers,
					});
					resolve({
						error: false,
						data: response.data,
					});
				} catch (err: any) {
					reject({
						error: true,
						data: err.response?.data || err.message, // Ensure safe access to `err.response`
					});
				}
			})(); // Invoke the async function immediately
		});
	};

	callOtherMicroServicesWithAuthorization = (data_array: any, base_url: string, api_url: string, data_headers = { 'content-type': 'application/json', 'Authorization': '' }) => {
		return new Promise((resolve, reject) => {
			// Use an IIFE to handle async operations
			(async () => {
				try {
					const response = await axios.post(base_url + api_url, data_array, {
						headers: data_headers,
					});
					resolve({
						error: false,
						data: response.data,
					});
				} catch (err: any) {
					reject({
						error: true,
						data: err.response?.data || err.message, // Ensure safe access to `err.response`
					});
				}
			})(); // Invoke the async function immediately
		});
	};


	public floraResponseBuilder(res: statusBuild, link: string): void {
		let response_data = {
			link
		};
		res.status(helperConfig.HTTP_RESPONSE_OK);
		res.send({ ...response_data });
	}

	public generateFileNameWithMiliSeconds(starting_name: string | undefined, fileExtension: string) {
		const currentTimestampMs = moment().valueOf();

		// REPLACE SPACES WITH HYPHENS IF STARTING_NAME IS DEFINED
		const sanitizedStartingName = starting_name ? starting_name.replace(/\s+/g, '-') : '';

		if (starting_name != "") {
			return sanitizedStartingName + "-" + currentTimestampMs + "." + fileExtension;
		} else {
			return currentTimestampMs + "." + fileExtension;
		}
	}

	public getCurrentISTDateTimeWithDaysToAdd(daysToAdd: number = 0): string {
		let utc = Date.now() / 1000;
		return moment.unix(utc)
			.add(daysToAdd, 'days') // ADD SPECIFIED NUMBER OF DAYS
			.tz(process.env.TZ as string)
			.format('YYYY-MM-DD HH:mm:ss');
	}

	/* Function for check valid date format */
	public checkValidDateFormat(date: string): boolean {
		if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
			return false;
		}
		return true
	}

	public async sliceCharacterLength(data: string, givenCharLength: number): Promise<string> {
		let sliceCharLength = givenCharLength + 1;
		if (data.length > givenCharLength) {
			return data.slice(0, sliceCharLength)
		} else {
			return data
		}
	}
	
	public generateFileName(originalFileName: string) {
		originalFileName = originalFileName.replace(/ /g, '_'); // IF FILENAME CONTAINS ANY SPACE REPLACE IT WITH '_'
		let new_name = global.Helpers.randomNumberSixDig() + '' + global.Helpers.getCurrentTimestampUTCunix() + '_' + originalFileName;
		return new_name;
	}

	callSendMailMicroServices = async (Data: any, route: string) => {
		try {
			let apiRoute = route;
			if (process.env.SEND_EMAIL == '1') {
				return await this.callMessageGRPCServices(Data, apiRoute);
			}
		} catch (error) {
			global.logs.writelog('callSendMailMicroServices', ["Error : ", error]);
		}
	}

	callMessageGRPCServices = async (data_array: any, method_type: string) => {
		try {
			let callAuthService: any = {}
			data_array.emailbody = JSON.stringify(data_array.emailbody);
			if (method_type == 'mailSend') {
				callAuthService = await gRPCMailServer.mailSendMethodAsync(data_array);
			}
			return callAuthService;
		} catch (error: any) {
			return false;
		}
	}
	getDynamicQuality = (sizeInBytes: any) => {
		const sizeInMB = sizeInBytes / (1024 * 1024);
		if (sizeInMB > 5) return 85;     // VERY LARGE IMAGE
		if (sizeInMB > 2) return 90;     // LARGE IMAGE
		if (sizeInMB > 1) return 95;     // MEDIUM IMAGE
		return 100;                      // VERY SMALL IMAGE KEEP ORIGINAL QUALITY
	};

	public reduceImageQuality = async (dataObj: any): Promise<any> => {
		try {
			let fromPath: string = dataObj.fromPath;
			let toPath: string = dataObj.toPath;
			let img_ext: string = (dataObj.img_ext as string).toLowerCase();
			let quality: number = dataObj.quality as number;
			var file: object = {};

			if (img_ext === 'png') {
				file = await sharp(fromPath).png({ quality: quality }).sharpen().toFile(toPath);
			} else if (img_ext === 'webp') {
				file = await sharp(fromPath).webp({ quality: quality }).sharpen().toFile(toPath);
			} else if (img_ext === 'jpg' || img_ext === 'jpeg') {
				file = await sharp(fromPath).jpeg({ quality: quality, mozjpeg: true }).sharpen().toFile(toPath);
			} else {
				return "";
			}

			if (file) {
				return file;
			} else {
				return "";
			}
		} catch (error) {
			return "";
		}
	};

    generateMongooseShortId = () => {
		let objectId:any = new mongoose.Types.ObjectId();
		return objectId.toString().toUpperCase().slice(-10); // Last 10 characters of `_id`
	}

	checkOtpTime(){
        const currentDate = new Date();
        const oneHourAgo = new Date(currentDate.getTime() - Number(USER_CONFIGS.OTP_LIMIT_TIME) * 60 *1000);
        return oneHourAgo;
    }   
	
}