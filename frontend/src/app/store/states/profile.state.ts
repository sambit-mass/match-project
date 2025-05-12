import { Injectable } from '@angular/core';
import { HttpService } from '@app/core/http';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  GetAnswer,
  SaveAllAnswerFromProfile,
  UpdateProfile,
  ViewProfile,
} from '../actions/profile.action';
import { tap } from 'rxjs';

interface IProfileStateModel {
  getAnswerList: IAnswerList[];
  updateProfileSuccessMsg: string;
  viewProfile: IViewProfile | null;
}

@State<IProfileStateModel>({
  name: 'profile',
  defaults: {
    getAnswerList: [],
    updateProfileSuccessMsg: '',
    viewProfile: null,
  },
})
@Injectable()
export class ProfileState {
  constructor(private _http: HttpService) {}

  @Selector()
  static getAnswerList(state: IProfileStateModel) {
    return state.getAnswerList;
  }

  @Selector()
  static updateProfileSuccessMsg(state: IProfileStateModel) {
    return state.updateProfileSuccessMsg;
  }

  @Selector()
  static viewProfile(state: IProfileStateModel) {
    return state.viewProfile;
  }

  @Action(GetAnswer)
  GetAnswer(ctx: StateContext<IProfileStateModel>, { payload }: GetAnswer) {
    return this._http.post('user/getAnswers', payload).pipe(
      tap(apiRes => {
        const response = apiRes.response.data.answersList;
        ctx.patchState({
          getAnswerList: response,
        });
      })
    );
  }

  @Action(UpdateProfile)
  UpdateProfile(ctx: StateContext<IProfileStateModel>, { payload }: UpdateProfile) {
    return this._http.post('user/update', payload).pipe(
      tap(apiResult => {
        const msg = apiResult.response.status.msg;
        ctx.patchState({
          updateProfileSuccessMsg: msg,
        });
      })
    );
  }

  @Action(ViewProfile)
  ViewProfile(ctx: StateContext<IProfileStateModel>) {
    return this._http.get('user/viewProfile').pipe(
      tap(apiResult => {
        const response = apiResult.response.data;
        ctx.patchState({
          viewProfile: response,
        });
      })
    );
  }

  @Action(SaveAllAnswerFromProfile)
  SaveAllAnswerFromProfile(
    ctx: StateContext<IProfileStateModel>,
    { payload }: SaveAllAnswerFromProfile
  ) {
    return this._http.post('user/saveAnswers', payload).pipe(
      tap(apiResult => {
        const state = ctx.getState();
        const currentAnswers = state.getAnswerList;

        const questionnaireId = payload.answers_data[0].questionnaire_id;
        const questionId = payload.answers_data[0].answers[0].q_id;
        const selectedOptionId = payload.answers_data[0].answers[0].sel_opt_id;

        const updatedAnswers = currentAnswers.map(questionnaire => {
          if (questionnaire.questionnaire_id !== questionnaireId) return questionnaire;

          const updatedInnerAnswers = questionnaire.answers.map(answer => {
            if (answer.q_id !== questionId) return answer;

            // Return updated answer
            return {
              ...answer,
              sel_opt_id: selectedOptionId,
            };
          });

          // Return updated questionnaire
          return {
            ...questionnaire,
            answers: updatedInnerAnswers,
          };
        });

        ctx.patchState({
          getAnswerList: updatedAnswers,
        });
      })
    );
  }
}
