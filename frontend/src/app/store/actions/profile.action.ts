export class GetAnswer {
  static readonly type = '[GetAnswer] Post';
  constructor(public payload: { questionnaire_type_id: number | string }) {}
}

export class UpdateProfile {
  static readonly type = '[UpdateProfile] Post';
  constructor(public payload: IUpdateProfilePayload | null) {}
}

export class ViewProfile {
  static readonly type = '[ViewProfile] Get';
}

export class SaveAllAnswerFromProfile {
  static readonly type = '[SaveAllAnswerFromProfile] Post';
  constructor(public payload: ISaveAllAnswerParam) {}
}
