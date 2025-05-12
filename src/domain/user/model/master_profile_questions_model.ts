import { MongoDbModel } from "../../../mongodb_model"

export class MasterProfileQuestion extends MongoDbModel {
    constructor() {
        super('master_profile_questions', {
            questionnaire_type_id: {
                type: Number,
                required: true
            },
            questionnaire_type: {
                en: {
                    type: String,
                    required: true
                },
                zh: {
                    type: String,
                    required: true
                }
            },
            questions: [
                {
                    q_id: {
                        type: Number,
                        required: true
                    },
                    selection_type: {
                        type: Number,
                        required: true
                    },
                    question: {
                        en: {
                            type: String,
                            required: true
                        },
                        zh: {
                            type: String,
                            required: true
                        }
                    },
                    question_desc: {
                        en: {
                            type: String,
                            required: true
                        },
                        zh: {
                            type: String,
                            required: true
                        }
                    },
                    options: [
                        {
                            op_id: {
                                type: Number,
                                required: true
                            },
                            en: {
                                type: String,
                                required: true
                            },
                            zh: {
                                type: String,
                                required: true
                            }
                        }
                    ]
                }
            ]
        }, {
            timestamps: true,
            collection: 'master_profile_questions',  // Collection name
            versionKey: false  // Disable versioning (_v field)
        });
    }
}