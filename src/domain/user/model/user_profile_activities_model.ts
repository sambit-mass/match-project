import { MongoDbModel } from "../../../mongodb_model";

export class UserProfileActivities extends MongoDbModel {
    constructor() {
        super(
            "user_profile_activities",
            {
                user_id: {
                    type: Number,
                    required: true,
                    unique: true,
                },
                unique_id: {
                    type: String,
                    required: true,
                    unique: true,
                },
                is_new_user: {
                    type: Boolean,
                    required: true
                },
                timestamp: {
                    type: Date,
                    required: true
                },
                updated_fields_json: {
                    type: [
                        {
                            field_name: {
                                type: String,
                                required: true
                            },
                            field_value: [
                                {
                                    type: String,
                                    required: true
                                }
                            ]

                        }
                    ],
                    required: true
                }
            },
            {
                timestamps: true,
                collection: "user_profile_activities",
                versionKey: false,
            }
        );
    }
}
