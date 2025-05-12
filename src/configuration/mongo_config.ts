import mongoose from 'mongoose';
export class MongoConnect {
    connectMongoDB() {
        // CONNECT TO MONGODB
        mongoose.connect(process.env.MONGO_URI as string + process.env.MONGO_DATABASE_NAME as string, {
            autoIndex: false // Disable automatic index creation
        });
        if (process.env.NODE_ENV == 'local') {
            mongoose.set('debug', true);
        }
        return mongoose;
    }
}