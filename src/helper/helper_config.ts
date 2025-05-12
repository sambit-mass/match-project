import dotenv from "dotenv";
dotenv.config();

export const helperConfig = {
    //HTTP CODES
    "HTTP_RESPONSE_OK" : 200,
    "HTTP_RESPONSE_OK_NO_CONTENT" : 204,
    "HTTP_RESPONSE_BAD_REQUEST" : 400,
    "HTTP_RESPONSE_UNAUTHORIZED" : 401,
    "HTTP_RESPONSE_FORBIDDEN" : 403,
    "HTTP_RESPONSE_NOT_FOUND" : 404,
    "HTTP_RESPONSE_METHOD_NOT_ALLOWED" : 405,
    "HTTP_RESPONSE_NOT_ACCEPTABLE" : 406,
    "PARENTS_APPLICATION_NAME": "Fusion Matrix"
};

export const RABBIT_MQ_CONFIG = {
    URI: process.env.RABBIT_MQ_URI,
    TASK: process.env.RABBIT_MQ_TASK,
    QUEUE: process.env.RABBIT_MQ_QUEUE
}