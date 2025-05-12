interface IAnswerList {
  questionnaire_id: number;
  answers: IAnswer[];
  completed_at: string;
}
interface IAnswer {
  q_id: number;
  sel_opt_id: number[];
}

interface IUpdateProfilePayload {
  email?: string;
  user_first_name?: string;
  phone_number?: string;
  gender?: number;
  country?: string;
  city?: string;
  zipcode?: string;
  dob?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
  introduction?: string;
  introduction?: string;
  university?: string;
  political_view?: string;
}

interface IViewProfile {
  user_first_name: string;
  email: string;
  phone_number: string;
  gender: number;
  country: string;
  zipcode: string;
  city: string;
  dob: string;
  user_status: number;
  introduction: IIntroduction;
  profile_completeness: string;
  images: IImage[];
  university: string;
  political_view: string;
  unique_id: string;
}

interface IImage {
  image_name: string;
  image_ext: string;
  is_main_image: boolean;
  is_verified: boolean;
  modification_timestamp: null;
}

interface IIntroduction {
  en: string;
  zh: string;
}

interface ICategoryList {
  questionnaire_type_id: number;
  questionnaire_type: IIntroduction;
  url?: string;
}

interface IFactfileList {
  questionnaireTypeId: number;
  qId: number;
  name?: IIntroduction;
  questionText: Record<string, string> | null;
  text: Record<string, string> | null;
  logoUrl: string;
  showType: string; //"all" for showing one question,"single" for showing one question,"none" for profile update which have no no question
}

interface ISearchCategory {
  questionnaireTypeId: number;
  qId: number;
  questionName: IIntroduction;
  question: IIntroduction;
}
