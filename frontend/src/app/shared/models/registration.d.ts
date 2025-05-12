interface IRegistrationPayload {
  user_first_name: string;
  email: string;
  user_type: number;
  password: string;
  confirm_password: string;
  phone_number: string;
  gender: string;
  country: string;
  zipcode: string;
  region: string;
  city: string;
  dob: string;
  height: number;
  is_social_reg: number;
  social_id: string;
  social_token: string;
  social_type: string;
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
  answers_data: IAnswersData[];
}

interface IAnswersData {
  questionnaire_id: number;
  answers: IAnswer[];
}

interface IAnswer {
  q_id: number;
  sel_opt_id: number[] | undefined;
  sel_opt_text: string;
  field_name?: string;
  field_value?: string[];
}

interface IUserUpdatePayload {
  user_details_id: number;
  user_first_name: string;
  phone_number: string;
  gender: number;
  country: string;
  city: string;
  zipcode: string;
  dob: string;
  height: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface IQuestionnaire {
  questionnaire_type_id: number;
  questionnaire_type: ILanguageText;
  questions: IQuestion[];
}

interface IQuestion {
  q_id: number;
  field_name: string;
  selection_type: number; // 0 => SINGLE SELECT, 1 => MULTI SELECT, 2 => RANGE
  question: ILanguageText;
  question_desc: ILanguageText;
  options: IOption[];
}

interface IQuestionAnswer {
  q_id: number;
  field_name: string;
  selection_type: number; // 0 => SINGLE SELECT, 1 => MULTI SELECT, 2 => RANGE
  question: ILanguageText;
  question_desc: ILanguageText;
  options: IOption[];
  answerText?: ILanguageText;
  optionText?: string;
  questionnaireTypeId?: number;
  questionnaireType?: ILanguageText;
  url?: string;
}

interface ILanguageText {
  en: string;
  zh: string;
  flag?: string;
}

interface IOption {
  op_id: number;
  en: string;
  zh: string;
  selected?: boolean;
}

interface ISendOtp {
  otp_for: number; // 1 => REGISTRATION, 2 => FORGOT PASSWORD
  email: string;
  is_resend: number;
}

interface IVerifyOtp {
  otp_for: number; // 1 => REGISTRATION, 2 => FORGOT PASSWORD
  email: string;
  otp: number;
}

interface ISaveAllAnswerParam {
  answers_data: IAnswersData[];
}
interface IAnswersData {
  questionnaire_id: number;
  answers: IAnswer[];
}

interface IViewProfile {
  user_first_name: string;
  ques_submit_status: number;
  introduction: ILanguageText;
  email: string;
  user_status: number;
  user_type: number;
  registration_status: number;
  phone_number: string;
  gender: number;
  country: string;
  zipcode: string;
  city: string;
  dob: string;
  profile_completeness: string;
  profile_image: string;
  user_id: string;
}
interface IAllImages {
  image_path: string;
  is_main_image: boolean;
  is_verified: boolean;
}

interface IAutoGenerateParams {
  user_id: string;
  description: string;
  request_type: string;
}
