import { tap } from 'rxjs';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpService } from '@app/core/http';
import {
  AutoGenerateIntroduction,
  ClearImage,
  DeleteProfileImage,
  GetAllImages,
  GetRegQuestions,
  PatchProfileDetails,
  SaveAllAnswer,
  SendOtp,
  UploadProfileImage,
  VerifyOtp,
  ViewProfile,
} from '../actions/registration.action';
import { CookieService } from 'ngx-cookie-service';
import { appSettings } from '@app/config';
import { CommonService } from '@app/core/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

interface IRegistrationStateModel {
  apiSuccessMsg: string;
  regQuestionList: IQuestionnaire[];
  saveAllAnswer: [];
  profileDetails: IViewProfile | null;
  getAllImages: IAllImages[] | null;
  autoGenerateIntroduction: string | null;
}

@State<IRegistrationStateModel>({
  name: 'registration',
  defaults: {
    apiSuccessMsg: '',
    regQuestionList: [],
    saveAllAnswer: [],
    profileDetails: null,
    getAllImages: null,
    autoGenerateIntroduction: null,
  },
})
@Injectable()
export class RegistrationState {
  private credentials: string = appSettings.credentialsKey;
  constructor(
    private _http: HttpService,
    private _cookieService: CookieService,
    private _commonService: CommonService,
    private _toastr: ToastrService,
    private _translate: TranslateService
  ) {}

  /* Get api success message from state */
  @Selector()
  static apiSuccessMsg(state: IRegistrationStateModel) {
    return state.apiSuccessMsg;
  }

  /* Get before registration question list from state */
  @Selector()
  static regQuestionList(state: IRegistrationStateModel) {
    return state.regQuestionList;
  }

  @Selector()
  static saveAllAnswer(state: IRegistrationStateModel) {
    return state.saveAllAnswer;
  }

  @Selector()
  static profileDetails(state: IRegistrationStateModel) {
    return state.profileDetails;
  }

  @Selector()
  static getAllImages(state: IRegistrationStateModel) {
    return state.getAllImages;
  }

  @Selector()
  static autoGenerateIntroduction(state: IRegistrationStateModel) {
    return state.autoGenerateIntroduction;
  }

  /* Action to fetch before registration question list */
  @Action(GetRegQuestions)
  GetRegQuestions(ctx: StateContext<IRegistrationStateModel>, { payload }: GetRegQuestions) {
    return this._http.post('user/getQuestions', payload).pipe(
      tap(apiRes => {
        const response = apiRes.response.data.questionsList;
        ctx.patchState({
          regQuestionList: response,
        });
      })
    );
  }

  /* Action to send otp*/
  @Action(SendOtp)
  SendOtp(ctx: StateContext<IRegistrationStateModel>, { payload }: SendOtp) {
    return this._http.post('user/sendOtp', payload).pipe(
      tap(apiResult => {
        ctx.patchState({
          apiSuccessMsg: apiResult.response.status.msg,
        });
      })
    );
  }

  /* Action to verify otp*/
  @Action(VerifyOtp)
  VerifyOtp(ctx: StateContext<IRegistrationStateModel>, { payload }: VerifyOtp) {
    return this._http.post('user/verifyOtp', payload).pipe(
      tap(apiResult => {
        const state = ctx.getState();
        const profileDetails = state.profileDetails;
        ctx.patchState({
          apiSuccessMsg: apiResult.response.status.msg,
        });
        if (profileDetails) {
          ctx.patchState({
            profileDetails: {
              ...profileDetails,
              registration_status: 3,
            },
          });
        }
      })
    );
  }

  @Action(SaveAllAnswer)
  SaveAllAnswer(ctx: StateContext<IRegistrationStateModel>, { payload }: SaveAllAnswer) {
    return this._http.post('user/saveAnswers', payload).pipe(
      tap(apiResult => {
        const state = ctx.getState();
        let profileDetails = state.profileDetails;
        ctx.patchState({
          saveAllAnswer: apiResult.response,
        });
        if (profileDetails) {
          if (payload.answers_data[0].questionnaire_id === 9) {
            profileDetails = {
              ...profileDetails,
              registration_status: 5,
            };
          }
          ctx.patchState({
            profileDetails: {
              ...profileDetails,
              ques_submit_status: payload.answers_data[0].questionnaire_id,
            },
          });
        }
      })
    );
  }

  @Action(UploadProfileImage)
  UploadProfileImage(ctx: StateContext<IRegistrationStateModel>, { payload }: UploadProfileImage) {
    return this._http.post('user/updateProfileImages', payload).pipe(
      tap(apiResult => {
        const state = ctx.getState();
        const profileDetails = state.profileDetails;
        ctx.patchState({
          apiSuccessMsg: apiResult.response.status.msg,
        });
        if (profileDetails) {
          ctx.patchState({
            profileDetails: {
              ...profileDetails,
            },
          });
        }
      })
    );
  }

  @Action(GetAllImages)
  GetAllImages(ctx: StateContext<IRegistrationStateModel>) {
    return this._http.get('user/getAllImages').pipe(
      tap(apiResult => {
        const response = apiResult.response.data;
        ctx.patchState({
          getAllImages: response.images,
        });
      })
    );
  }

  @Action(DeleteProfileImage)
  DeleteProfileImage(ctx: StateContext<IRegistrationStateModel>, { payload }: DeleteProfileImage) {
    return this._http.delete('user/deletProfileImage', payload).pipe(tap(() => {}));
  }

  @Action(ViewProfile)
  ViewProfile(ctx: StateContext<IRegistrationStateModel>) {
    return this._http.get('user/viewProfile').pipe(
      tap(apiResult => {
        ctx.patchState({
          profileDetails: apiResult.response.data,
        });
      })
    );
  }

  @Action(PatchProfileDetails)
  patchProfileDetails(ctx: StateContext<IRegistrationStateModel>, { data }: PatchProfileDetails) {
    ctx.patchState({
      profileDetails: data,
    });
  }

  @Action(ClearImage)
  ClearImage(ctx: StateContext<IRegistrationStateModel>, { data }: ClearImage) {
    ctx.patchState({
      getAllImages: data,
    });
  }

  @Action(AutoGenerateIntroduction)
  AutoGenerateIntroduction(
    ctx: StateContext<IRegistrationStateModel>,
    { payload }: AutoGenerateIntroduction
  ) {
    return this._http.post('aboutme/create_aboutme', payload).pipe(
      tap(apiResult => {
        ctx.patchState({
          autoGenerateIntroduction: apiResult.response.data.result,
        });
      })
    );
  }
}
