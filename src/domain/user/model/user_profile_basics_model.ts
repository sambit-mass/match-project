import { MongoDbModel } from "../../../mongodb_model";

export class UserProfileBasics extends MongoDbModel {
  constructor() {
    super(
      "user_profile_basics",
      {
        user_id: {
          type: Number,
          required: true,
          unique: true,
        },
        unique_id:{
          type: String,
          required: true,
          unique: true,
        },
        user_first_name: {
          type: String,
          required: false,
        },
        user_phone_number: {
          type: String,
          required: false,
        },
        user_gender: {
          type: Number,
          required: false,
        },
        user_country: {
          type: String,
          required: false,
        },
        user_city: {
          type: String,
          required: false,
        },
        user_zip: {
          type: String,
          required: false,
        },
        user_dob: {
          type: String,
          required: false,
        },
        user_age: {
          type: Number,
          required: false,
        },
        user_region: {
          type: String,
          required: false,
        },
        ques_submit_status: {
          type: Number,
          required: true,
        },
        introduction: {
          en: {
            type: String
          },
          zh: {
            type: String
          }
        },
        university: {
          type: String
        },
        political_view: {
          type: String
        }
      },
      {
        timestamps: true,
        collection: "user_profile_basics",
        versionKey: false,
      }
    );
  }
}
