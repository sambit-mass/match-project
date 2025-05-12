import { MongoDbModel } from "../../../mongodb_model"

export class UserProfileImages extends MongoDbModel {
    constructor() {
        super('user_profile_images', {
            user_id: {
                type: Number,
                required: true
            },
            images: {
                type: [{
                    _id:false,
                    image_name: {
                        type: String,
                        required: false
                    },
                    image_ext: {
                        type: String,
                        required: false
                    },
                    is_main_image: {
                        type: Boolean,
                        default: false
                    },
                    is_verified: {
                        type: Boolean,
                        default: false
                    },
                    modification_timestamp: {
                        type: Date,
                        required: true
                    }
                }],
                required: true
            },
            selfie_image: {
                type: String,
                default: ''
            }
        }, {
            timestamps: true,
            collection: 'user_profile_images',
            versionKey: false
        })
    }
}