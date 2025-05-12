export class GetRegQuestions {
  static readonly type = '[GetRegQuestions] post';
  constructor(public payload: { questionnaire_type_id: number | string }) {}
}

export class SendOtp {
  static readonly type = '[SendOtp] post';
  constructor(public payload: ISendOtp) {}
}

export class VerifyOtp {
  static readonly type = '[VerifyOtp] post';
  constructor(public payload: IVerifyOtp) {}
}

export class UploadProfileImage {
  static readonly type = '[UpdateProfileImage] post';
  constructor(public payload: FormData) {}
}

export class SaveAllAnswer {
  static readonly type = '[SaveAllAnswer] Post';
  constructor(public payload: ISaveAllAnswerParam) {}
}

export class ViewProfile {
  static readonly type = '[ViewProfile] Post';
}

export class PatchProfileDetails {
  static readonly type = '[PatchProfileDetails] Patch';
  constructor(public data: IViewProfile | null) {}
}
export class GetAllImages {
  static readonly type = '[GetAllImages] post';
}

export class DeleteProfileImage {
  static readonly type = '[DeleteProfileImage] delete';
  constructor(public payload: { delete_position: number[] }) {}
}

export class ClearImage {
  static readonly type = '[ClearImage] post';
  constructor(public data: null) {}
}

export class AutoGenerateIntroduction {
  static readonly type = '[AutoGenerateIntroduction] post';
  constructor(public payload: IAutoGenerateParams) {}
}
