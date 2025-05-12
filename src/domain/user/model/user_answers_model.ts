import { MongoDbModel } from "../../../mongodb_model";

export class UserAnswers extends MongoDbModel {
  constructor() {
    super(
      "user_answers",
      {
        user_id: {
          type: Number,
          required: true,
        },
        questionnaire_id: {
          type: Number,
          required: true,
        },
        answers: {
          type: [
            {
              _id: false,
              q_id: {
                type: Number,
                required: true,
              },
              sel_opt_id: [
                {
                  type: Number,
                  required: true,
                },
              ],
              sel_opt_text: {
                type: String,
                required: false,
              }
            },
          ],
          required: true,
        },
      },
      {
        timestamps: true,
        collection: "user_answers",
        versionKey: false,
      }
    );
  }

  public getLastQuestionnaireId(user_id: number) {
    return this.Model.find({
      user_id: user_id
    }, {
      questionnaire_id: 1,
      _id: 0
    })
      .sort({ createdAt: -1 })
      .limit(1);
  }

  public getUserAnswersList(user_id: number) {
    const pipeline = [
      {
        $match: {
          user_id: user_id
        }
      },
      {
        $lookup: {
          from: "master_profile_questions",
          localField: "questionnaire_id",
          foreignField: "questionnaire_type_id",
          as: "master_questions"
        }
      },
      {
        $unwind: "$master_questions"
      },
      {
        $project: {
          answers: 1,
          "master_questions.questions": 1,
          "master_questions.questionnaire_type_id": 1
        }
      }
    ];
    return this.Model.aggregate(pipeline)
  }
}
