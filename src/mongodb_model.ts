import { MongoConnect } from './configuration/mongo_config';
import mongoose, { Document, Schema, Model as MongooseModel, PipelineStage } from 'mongoose';

export class MongoDbModel {
    public connectionObj = new MongoConnect();
    public Model: MongooseModel<any>;

    constructor(name: string, schema: object, options: any = {}) {
        // Connect to MongoDB
        this.connectionObj.connectMongoDB();

        // Define the schema and model
        const mongooseSchema = new Schema(schema, options);
        this.Model = mongoose.model(name, mongooseSchema);
    }

    /**
     * Find a single document based on the query
     * @param query - The query object
     */
    public findOne(query: object, data: object): Promise<Document | null> {
        return this.Model.findOne(query, data)
    }

    /**
     * Count the documents matching the query
     * @param query - The query object
     */
    public count(query: object): Promise<number> {
        return this.Model.countDocuments(query)
    }

    /**
     * Update a document based on the query
     * @param data - The data to update
     * @param query - The query to match the document
     */
    public update(query: object, data: object): Promise<any> {
        return this.Model.updateOne(query, data)
    }

    /**
     * Insert a new document into the collection
     * @param data - The document data to insert
     */
    public addNewRecord(data: object): Promise<Document> {
        return this.Model.insertOne(data);
    }

    /**
     * Delete a document based on the query
     * @param query - The query to match the document
     */
    public delete(query: object): Promise<any> {
        return this.Model.deleteOne(query)
    }

    /**
     * Bulk insert documents
     * @param dataArr - Array of documents to insert
     */
    public bulkInsert(dataArr: object[]): Promise<any> {
        return this.Model.insertMany(dataArr);
    }

    /**
     * Find all documents matching the query
     * @param query - The query object
     */
    public findAll(query: object, projection: object = {}): Promise<Document[]> {
        return this.Model.find(query, projection)
    }

    /**
     * Find and count all documents matching the query
     * @param query - The query object
     */
    public findAndCountAll(query: object): Promise<{ docs: Document[], count: number }> {
        return this.Model.find(query).exec().then(docs => {
            return this.Model.countDocuments(query).exec().then(count => {
                return { docs, count };
            });
        });
    }

    /**
     * Aggregate a document based on the query
     * @param query - The query to match the document
     */
    public findAggregate(query: PipelineStage[]): Promise<any> {
        return this.Model.aggregate(query)
    }
}
