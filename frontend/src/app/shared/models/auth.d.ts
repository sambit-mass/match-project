interface IAuthParam {
  email: string;
  password: string;
  browser_id: string;
  session_id: string;
  browser_name: string;
  browser_version: string;
  login_type: 1;
  device_os_type: number;
  social_id: string;
  social_token: string;
  social_type: string;
}

interface IAuthCodeInfo {
  authorization_code: string;
  redirect_url: string;
}

interface ITokenInfo {
  access_token: string;
  refresh_token: string;
  refresh_token_expire_timestamp: string;
  user_type: string;
  user_id: string;
  enc_username: string;
  user_status: number; // 0=>Inactive, 1=>Active, 2=>=>OTP Not Verified Yet, 3=>Profile Image Not Uploaded Yet, 4=>Payment Not Done But Active, 5=>Suspended
  ques_submit_status: number;
  profile_image: string;
  user_name: string;
  ques_submit_status: number;
  registration_status: number;
}

interface IUserRegistration {
  user_first_name: string;
  email: string;
  user_type: number;
  password?: string; // Optional since it's not mandatory
  gender: number;
  country: string;
  zipcode: string;
  dob: string;
  is_social_reg: number;
  social_id: string;
  social_token: string;
  social_type: string; // 1=>Gmail, 2=>Apple, 3=>Facebook
  is_verified: number;
  device_os_type: number;
  app_version: string;
  device_uid: string;
  device_token: string;
  device_name: string;
  device_model: string;
  device_version: string;
  browser_id: string;
  browser_version: string;
  session_id: string;
  browser_name: string;
  answers_data: IAnswerData[];
}

export interface IAnswerData {
  questionnaire_id: number;
  answers: IAnswer[];
}

export interface IAnswer {
  q_id: number;
  sel_opt_id: number[]; // Array of selected option IDs
  sel_opt_text: string; // Optional text input
}
