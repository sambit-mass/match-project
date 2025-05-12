import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { promisify } from "util";
import dotenv from "dotenv";
dotenv.config();

const PROTO_PATH = "./protos/auth.proto";
const MAIL_SERVICE_PROTO_PATH = "./protos/mail_service.proto";

// Load protos from the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, // Keep the original case of field names as specified in the .proto file
    longs: String,  // Represent long fields (64-bit integers) as strings in JavaScript
    enums: String,  // Represent enum fields as their string names in JavaScript
    defaults: true, // Include default values for fields in the generated objects
    oneofs: true    // Include virtual oneof fields in the generated objects
});

const mailServicePackageDefinition = protoLoader.loadSync(MAIL_SERVICE_PROTO_PATH, {
    keepCase: true, // Keep the original case of field names as specified in the .proto file
    longs: String,  // Represent long fields (64-bit integers) as strings in JavaScript
    enums: String,  // Represent enum fields as their string names in JavaScript
    defaults: true, // Include default values for fields in the generated objects
    oneofs: true    // Include virtual oneof fields in the generated objects
});

const authProto = (grpc.loadPackageDefinition(packageDefinition) as any).AuthService;
const mailServiceProto = (grpc.loadPackageDefinition(mailServicePackageDefinition) as any).MailService;

// Connect main server on port 3002
const gRPCMainServerHostPort = `${process.env.GRPC_HOST}:${process.env.GRPC_AUTH_PORT}`;
const gRPCMainServer = new authProto(gRPCMainServerHostPort, grpc.credentials.createInsecure());

gRPCMainServer.waitForReady(Date.now() + 5000, (error: Error | null) => {
    if (error) {
        console.log("Failed to connect to the main gRPC server");
    }
});

// Connect mail server on port 7000
const gRPCMailServerHostPort = `${process.env.GRPC_HOST}:${process.env.GRPC_MESSAGE_PORT}`;
const gRPCMailServer = new mailServiceProto(gRPCMailServerHostPort, grpc.credentials.createInsecure());

gRPCMailServer.waitForReady(Date.now() + 5000, (error: Error | null) => {
    if (error) {
        console.log("Failed to connect to the gRPC mail server");
    }
});

/* Set method as promisify START */
gRPCMainServer.loginMethodAsync = promisify(gRPCMainServer.generateAuthCode);
gRPCMainServer.generateTokenMethodAsync = promisify(gRPCMainServer.generateToken);
gRPCMainServer.regenerateTokenMethodAsync = promisify(gRPCMainServer.regenerateToken);
gRPCMainServer.generateAuthCodeFromRegistrationMethodAsync = promisify(gRPCMainServer.generateAuthCodeFromRegistration);

// MAIL SERVICE
gRPCMailServer.mailSendMethodAsync = promisify(gRPCMailServer.mailSend);

export { gRPCMainServer, gRPCMailServer };
