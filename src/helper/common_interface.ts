
export interface response_object_detail{
    data : object,
    status : {
        action_status : boolean,
        msg : string
    },     
    publish : {
        version : string,
        developer : string
    }
}

export interface IlogObjForWinston{
    application? : string,
    file_name? : string,
    trace_id? : string,
    severity? : string,
    message? : string,
    method_name? : string,
    request? : {
        headers : any
    }
}

export interface Ilogger_settingsForWinston{
    logger_generate_level? : any,
    logger_enable_write? : boolean, 
    logger_error_write_all? : boolean,
    generate_sql_query_log? : boolean,
    logger_enable_application_name? : string,
    logger_enable_module_name? : string
}

export interface IloggerForWinston{
    stream? : {},
    format? : {},
    error: (createMessage: string) => any,
    warn: (createMessage: string) => any,
    info: (createMessage: string) => any
}

export interface IoptionsForWinston{
    file? : fileForWinston,
    console? : optiinsForWinston
}

export interface fileForWinston{
    level?: string,
    filename?: string,
    handleExceptions?: boolean,
    json?: boolean,
    maxsize?: number,
    colorize?: boolean,
}

export interface optiinsForWinston{
    level?: string,
    handleExceptions?: boolean,
    json?: boolean,
    colorize?: boolean,
}

export interface S3helperClient{
    add?: Function[],
    addRelativeTo?: [],
    clone?: [],
    use?: [],
    remove?: [],
    removeByTag?: [],
    concat?: [],
    applyToStack?: [],
    identify?: [],
    resolve?: [],
    config:S3helperClientconfig
	send: (object: any,err:object) => any,
}

export interface S3helperClientconfig{
    apiVersion: string,
    base64Decoder: Function,
    base64Encoder: Function,
    disableHostPrefix: boolean,
    endpointProvider: Function,
    logger: {},
    serviceId: string,
    signerConstructor?: Function,
    signingEscapePath: boolean,
    urlParser: Function,
    useArnRegion: any,
    utf8Decoder: Function,
    utf8Encoder: Function,
    region: Function,
    credentials: Function,
    runtime: string,
    defaultsMode: any,
    bodyLengthChecker: Function,
    credentialDefaultProvider: Function,
    defaultUserAgentProvider: Function,
    eventStreamSerdeProvider: Function,
    getAwsChunkedEncodingStream: Function,
    maxAttempts: Function,
    md5: Function,
    requestHandler:  {},
    retryMode: any,
    sdkStreamMixin: Function,
    sha1: Function,
    sha256: Function,
    streamCollector: Function,
    streamHasher: Function,
    useDualstackEndpoint: Function,
    useFipsEndpoint: Function,
    useAccelerateEndpoint: boolean,
    useGlobalEndpoint?: any,
    disableMultiregionAccessPoints: boolean,
    defaultSigningName: string,
    endpoint?: any,
    tls: boolean,
    isCustomEndpoint?: boolean | undefined,
    retryStrategy?: any,
    systemClockOffset: number,
    signer: any,
    forcePathStyle: any,
    customUserAgent?: any,
    eventStreamMarshaller: {}
}

export interface S3helperClientresponse{
    error: boolean,
    message: string,
    data: string,
    MessageId : string,
    Messages : object
  
}

export interface s3Parts {
    PartNumber: number,
    ETag: string
}

export interface SQShelperClient{
    add?: Function[],
    addRelativeTo?: [],
    clone?: [],
    use?: [],
    remove?: [],
    removeByTag?: [],
    concat?: [],
    applyToStack?: [],
    identify?: [],
    resolve?: [],
    config:SQShelperClientconfig
	send: (object: any,err:object) => any,
}

export interface SQShelperClientconfig{
    apiVersion: string,
    base64Decoder: Function,
    base64Encoder: Function,
    disableHostPrefix: boolean,
    endpointProvider: Function,
    logger: {},
    serviceId: string,
    urlParser: Function,
    utf8Decoder: Function,
    utf8Encoder: Function,
    region: Function,
    credentials: Function,
    runtime: string,
    defaultsMode: any,
    bodyLengthChecker: Function,
    credentialDefaultProvider: Function,
    defaultUserAgentProvider: Function,
    maxAttempts: Function,
    md5: Function,
    requestHandler: {},
    retryMode: any,
    sha256: Function,
    streamCollector: Function,
    useDualstackEndpoint: Function,
    useFipsEndpoint: Function,
    defaultSigningName: string,
    endpoint?: any,
    tls: boolean,
    isCustomEndpoint?: boolean | undefined,
    retryStrategy: Function,
    systemClockOffset: number,
    signingEscapePath: boolean,
    signer: Function,
    customUserAgent?: any
}

export interface SQShelperClientresponse{
    error: boolean,
    message: string,
    data: string,
    MessageId : string,
    Messages : object
  
}

export interface statusBuild{
    status(value2 : number) : object,
    send(value1 : object) : object
}

export interface response_object_detail{
    data : object,
    status : {
        action_status : boolean,
        msg : string
    },     
    publish : {
        version : string,
        developer : string
    }
}

export interface methodNotAllowed{
    setHeader(value1 : string,value2 : string) : object,
    send(value3 : object) : object,
    status(value4 : number) : object,  
}

export interface sendMailResponse{
    accepted: [],
    rejected: [],
    ehlo: [],
    envelopeTime: number,
    messageTime: number,
    messageSize: number,
    response: string,
    envelope: {
        from: string,
        to: []
    },
    messageId: string
}

export interface dataForSes {
    '$metadata': {
        httpStatusCode: number,
        requestId: string,
        extendedRequestId: any ,
        cfId: any,
        attempts: number,
        totalRetryDelay: number
    },
    MessageId: string
}

export interface sesEmailParam {
    Source: string,
    Destination: {
        ToAddresses: [string]
    },
    Message: {
        Subject: {
            Data: string,
            Charset: string,
        },
        Body: {
            Html: {
                Data: string,
                Charset: string,
            },
        },
    }
}

export interface request_aadhar_number{
    aadhar_number:string
                
}

export interface IAPIHeaders {
    'Content-Type': string,
    'Accept': string,
    'X-API-Key': string | undefined,
    'X-Auth-Type': string,
    'X-Transaction-ID'?:string
}

export interface IAPIOptions {
    method: string;
    headers: {
    'Content-Type': string,
    'Accept': string,
    'X-API-Key': string | undefined,
    'X-Auth-Type': string
    }
}

export interface verify_aadhar_number{
    otp:string
    transaction_id:string            
}

export interface IConfigforEncryptDecrypt {
    algorithm: string;
    encryptionKey: string;
    salt?: string;
    iv: string;
    idEncryptionKey: string;
    idEncryptionIv: string;
}

export interface IGeneratePromptStringReq {
    prompt_str1: string;
    prompt_str2: string;
    prompt_str3: string | number;
    prompt_str4: any;
    prompt_str5: string;
    prompt_str6: string;
}
export interface ISignedUrlResponse {
    error: boolean;
    message: string;
    signedUrl: string;
}