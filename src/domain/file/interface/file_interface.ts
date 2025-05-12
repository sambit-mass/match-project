export interface IfileUploadService {
    opt_for: "profile_images",
    file_name: string,
}

export interface IimageUpload {
    portfolio_id?: number,
    opt_for: string,
    file_name?: string,
    userId?: string | number,
    file_size?: number
    isSave?: number
}

export interface IImageObj {
    fieldName: string,
    originalFilename: string,
    path: string,
    headers: {
        'content-disposition': string,
        'content-type': string
    },
    size: number
}