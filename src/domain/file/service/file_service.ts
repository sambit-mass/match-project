import {
    IfileUploadService
} from "../interface/file_interface";
import { s3_folder_path } from "../file_config";
import { S3Helper } from "../../../helper/awsS3_helper";

export class image_service {
    private _toS3Upload = new S3Helper();

    initLog() {
        global.logs.logObj.file_name = "V1-ImageService";
        global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
    }

    /**
     * @developer : Sumit Sil
     * @date : 01-04-2025
     * @description : SERVICE FOR IMAGE UPLOAD
    */
    async fileUploadService(imgFile: any[], where_cond: IfileUploadService) {
        this.initLog();
        const apiname_with_trace_id: string = 'fileUploadService - ';
        global.logs.writelog(apiname_with_trace_id, ['Parameter1 : ', imgFile]);
        global.logs.writelog(apiname_with_trace_id, ['Parameter2 : ', where_cond]);
        try {
            /**** UPLOADING MAIN IMAGE FILE ****/
            let file_name: any = '';
            let file_path = '';
            if (where_cond.opt_for == 'profile_images') {
                file_name = where_cond.file_name;
                file_path = s3_folder_path.s3_user_profile_images_path;
            }
            let fileUploadOptions = {
                fileinfo: imgFile,
                s3_key_path: file_path + file_name
            };

            try {
                let mainImgUpload: any = await this._toS3Upload.largeImageupload(fileUploadOptions); // Upload to S3
                global.logs.writelog(apiname_with_trace_id, ['mainImgUpload : ', mainImgUpload])
                let Response = false;
                if (mainImgUpload) {
                    Response = true;
                }
                return Response;
            }
            catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                return false;
            }
        }
        catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
            return false
        }
    }

    /**
     * @developer : Anjali Show
     * @date : 01-10-2024
     * @description : services for image delete
    */
    async imageDelete(imgFile: any, s3_file_path: any) {
        this.initLog();
        const apiname_with_trace_id: string = 'imageDelete - ';
        global.logs.writelog(apiname_with_trace_id, ['Parameter1 : ', imgFile]);

        try {
            let file_name: string = imgFile;
            let file_path: string = s3_file_path;
            try {
                let ImgDelete: any = await this._toS3Upload.deleteFileFromS3(file_path + file_name); // delete from S3
                global.logs.writelog(apiname_with_trace_id, ['Response-> delete from s3 : ', ImgDelete])

                if (!ImgDelete.error) {
                    return true;
                } else {
                    return false;
                }
            }
            catch (error: any) {
                global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
                return false;
            }
        } catch (error: any) {
            global.logs.writelog(apiname_with_trace_id, error.stack, 'ERROR');
            return false
        }
    }

}