import { S3helperClient, S3helperClientresponse, s3Parts, ISignedUrlResponse } from "./common_interface";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CreateMultipartUploadCommand, AbortMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, HeadObjectCommand, CopyObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import * as fs from 'fs';

export class S3Helper {

    private client: S3helperClient;

    constructor() {

        if (process.env.NODE_ENV == 'local') {
            this.client = new S3Client({
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
                    secretAccessKey: process.env.AWS_S3_SECRET_KEY as string
                }
            });
        } else {
            this.client = new S3Client({
                region: process.env.AWS_DEFAULT_REGION as string
            });
        }

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : File upload in S3 from local folder
        */
    public s3Upload = async (localFilepath: string, filename: string) => {

        let that = this;

        return new Promise(function (resolve, reject) {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: filename,
                Body: fs.readFileSync(localFilepath),
                //ACL: "public-read"
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'Unable to upload file in S3.', errorstack: err });
                } else {
                    /*Remove from local folder*/
                    fs.unlink(localFilepath, (err => {
                        if (err) console.error(err);
                    }));
                    /*End*/

                    return resolve({ error: false, message: 'File uploaded successfully in S3.', data: data });

                }
            });
        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Delete file from S3 (Single file)
     * @request : filepath(aws file path coming from env),filename (stored file name)
        */
    public deleteFileFromS3 = async (filepath: string) => {

        let that = this;

        return new Promise(function (resolve, reject) {

            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: filepath
            });

            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'Unable to delete file from S3.', errorstack: err });
                } else {
                    return resolve({ error: false, message: 'File deleted successfully from S3.', data: data });
                }
            });
        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Delete file from S3 (Multiple files)
     * @request param 'example-path/profile.jpg', 'example-path/something.md'
        */
    public deleteFilesFromS3 = async (filename: string) => {

        const that = this;
        return new Promise(function (resolve, reject) {
            const filesPathInS3 = [...filename]
            const command = new DeleteObjectsCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Delete: {
                    Objects: filesPathInS3.map((key) => ({ Key: key })),
                },
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'Unable to delete files from S3.', errorstack: err });
                } else {
                    return resolve({ error: false, message: 'Files deleted successfully from S3.', data: data });
                }
            });
        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Upload file directly into S3 (Single file)
        */
    public uploadFileDirectlyToS3 = async (filename: string, filepath: string) => {

        const that = this;

        return new Promise(function (resolve, reject) {

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: filepath + filename,
                Body: filepath + filename,
                //ACL: "public-read"
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'Unable to upload file in S3.', errorstack: err });
                } else {
                    return resolve({ error: false, message: 'File uploaded successfully in S3.', data: data });

                }
            });
        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Upload file directly into S3 (Multiple file)
        */
    public uploadFilesDirectlyToS3 = async (filename: [], filepath: string) => {

        const that = this;

        return new Promise(function (resolve, reject) {
            filename.forEach(function (value) {

                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: filepath + value['originalFilename'],
                    Body: filepath + value['originalFilename'],
                    //ACL: "public-read"
                });

                that.client.send(command, (err: object, data: S3helperClientresponse) => {
                    if (err) {
                        return resolve({ error: true, message: 'Unable to upload file in S3.', errorstack: err });
                    } else {
                        return resolve({ error: false, message: 'File uploaded successfully in S3.', data: data });

                    }
                });

            });

        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Upload ID initialization
        */
    public startUpload = async (s3_key_path: string, S3_BUCKET_NAME = process.env.AWS_S3_BUCKET) => {
        const that = this;
        return new Promise(function (resolve, reject) {

            const command = new CreateMultipartUploadCommand({
                Bucket: S3_BUCKET_NAME,
                Key: s3_key_path,
                //ACL: "public-read"
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'Unable to fetch upload ID.', errorstack: err });
                } else {
                    return resolve({ error: false, message: 'Upload id fetched successfully.', data: data });
                }
            });
        });
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Abort upload images
        */
    public abortUpload = async (uploadId: string, s3_key_path: string) => {

        const that = this;

        return new Promise(function (resolve, reject) {

            const command = new AbortMultipartUploadCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3_key_path,
                UploadId: uploadId
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({ error: true, message: 'abortUpload error.', errorstack: err });
                } else {
                    return resolve({ error: false, message: 'abortUpload success.', data: data });
                }
            });
        });

    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Upload part initialization
        */
    public uploadPart = async (buffer: Buffer, uploadId: string, partNumber: number, s3_key_path: string) => {

        const that = this;

        return new Promise(function (resolve, reject) {

            const command = new UploadPartCommand({
                Key: s3_key_path,
                Bucket: process.env.AWS_S3_BUCKET,
                Body: buffer,
                PartNumber: partNumber,
                UploadId: uploadId,
            });
            that.client.send(command, (err: object, data: s3Parts) => {
                if (err) reject({ PartNumber: partNumber, error: err });
                else resolve({ PartNumber: partNumber, ETag: data.ETag });
            });
        });

    }
    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Upload part initialization
        */
    public largeImageupload = async (fileUploadOptions: any, S3_BUCKET_NAME = process.env.AWS_S3_BUCKET as string) => {
        const that = this;
        const chunkSize = Math.pow(1024, 2) * 10;
        const data = fs.readFileSync(fileUploadOptions.fileinfo[0].path);
        const size = data.byteLength;
        const iterations = Math.ceil(size / chunkSize);
        const arr = Array.from(Array(iterations).keys());
        let UploadId = "";
        try {
            const uplaodID: any = await that.startUpload(fileUploadOptions.s3_key_path, fileUploadOptions.S3_BUCKET_NAME);
            UploadId = uplaodID.data.UploadId;
            const parts = await Promise.allSettled(
                arr.map((item) =>
                    this.uploadPart(data.slice(item * chunkSize, (item + 1) * chunkSize), UploadId, item + 1, fileUploadOptions.s3_key_path
                    )
                )
            );

            const failedParts = parts
                .filter((part) => part.status === "rejected")
                .map((part: any) => part.reason);

            const succeededParts = parts
                .filter((part) => part.status === "fulfilled")
                .map((part: any) => part.value);

            let retriedParts: any = [];

            if (failedParts.length !== 0)
                retriedParts = await Promise.all(
                    failedParts.map(({ PartNumber }) =>
                        this.uploadPart(
                            data.slice((PartNumber - 1) * chunkSize, PartNumber * chunkSize),
                            UploadId,
                            PartNumber,
                            fileUploadOptions.s3_key_path
                        )
                    )
                );

            succeededParts.push(...retriedParts);

            const completeResponse = await that.completeUpload(
                UploadId,
                succeededParts.sort((a, b) => a.PartNumber - b.PartNumber),
                fileUploadOptions.s3_key_path
            );
            return completeResponse;
        } catch (err: any) {
            const done = await that.abortUpload(UploadId, fileUploadOptions.s3_key_path);
            return false;
        }
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Complete file upload process
        */
    public completeUpload = async (uploadId: string, parts: any, key_path: string) => {

        const that = this;
        const command = new CompleteMultipartUploadCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key_path,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        });
        return new Promise((resolve, reject) => {
            that.client.send(command, (err: object, data: object) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    fileExistsInS3(filePath: string) {
        let that = this;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: filePath
        };
        return new Promise((resolve, reject) => {
            const command = new HeadObjectCommand(params);
            that.client.send(command, (error: any, data: object) => {
                if (!error) {
                    resolve(data);
                }
                if (error.name === 'NotFound' || error.$metadata.httpStatusCode === 404) { // FILE NOT FOUND
                    resolve(false);
                }
            });
        })
    }

    /**
     * @developer : Sumit Sil
     * @date : 17-04-2025
     * @description : Rename a file in S3
    */
    renameFileInS3(oldKey: string, newKey: string) {
        const that = this;
        const bucket = process.env.AWS_S3_BUCKET;

        return new Promise((resolve, reject) => {
            const copyParams = {
                Bucket: bucket,
                CopySource: `${bucket}/${oldKey}`,
                Key: newKey,
            };

            const copyCommand = new CopyObjectCommand(copyParams);

            that.client.send(copyCommand, (copyErr: any, copyData: object) => {
                if (!copyErr) {
                    // PROCEED TO DELETE THE ORIGINAL OBJECT
                    const deleteParams = {
                        Bucket: bucket,
                        Key: oldKey,
                    };
                    const deleteCommand = new DeleteObjectCommand(deleteParams);

                    that.client.send(deleteCommand, (deleteErr: any, deleteData: object) => {
                        if (!deleteErr) {
                            resolve(copyData); // SUCCESSFULLY RENAMED
                        } else if (deleteErr.name === 'NotFound' || deleteErr.$metadata?.httpStatusCode === 404) {
                            resolve(copyData); // FILE WAS ALREADY GONE AFTER COPY
                        } else {
                            resolve(deleteErr); // OTHER DELETION ERRORS
                        }
                    });
                } else if (copyErr.name === 'NotFound' || copyErr.$metadata?.httpStatusCode === 404) {
                    resolve(false); // ORIGINAL FILE NOT FOUND
                } else {
                    resolve(copyErr); // OTHER COPY ERRORS
                }
            });
        });
    }

    public getsignedUrl = async (filePath: string): Promise<ISignedUrlResponse>  => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: filePath
            };
            let expirationInSeconds: any = process.env.AWS_SIGNED_URL_EXP
            const command: any = new GetObjectCommand(params);
            getSignedUrl(this.client as any, command, { expiresIn: expirationInSeconds})
                .then(signedUrl => {
                    return resolve({error:false, message:'Signed url generated successfully.', signedUrl});
                })
                .catch(err => {
                    return reject({error:true, message:'Unable to generate signed url.', errorstack: err});
                });
        });
    }

}