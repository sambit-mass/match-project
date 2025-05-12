import { IConfigforEncryptDecrypt } from "./common_interface";
import * as crypto from 'crypto';

export class Encryption {
    private algorithm: string;
    private key: string;
    private iv: string;
    private idEncryptionKey: string;
    private idEncryptionIv: string;
    private config: any;

    constructor(config: IConfigforEncryptDecrypt) {
        this.algorithm = config.algorithm || 'aes-256-cbc';

        // Decode Base64 key and IV
        this.key = config.encryptionKey;
        this.iv = config.iv;
        this.idEncryptionKey = config.idEncryptionKey;
        this.idEncryptionIv = config.idEncryptionIv;

        // Ensure key is exactly 32 bytes
        if (this.key.length !== 32) {
            throw new Error(`Invalid Key: Expected 32 bytes, got ${this.key.length} bytes.`);
        }

        // Ensure IV is exactly 16 bytes
        if (this.iv.length !== 16) {
            throw new Error(`Invalid IV: Expected 16 bytes, got ${this.iv.length} bytes.`);
        }

        this.config = config;
    }

    encryptResponse(text: string): string {
        try {
            if (!text) return '';
            const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return encrypted;
        } catch (e: any) {
            return '';
        }
    }

    async decryptRequest(text: string): Promise<string> {
        try {
            if (!text) return '';
            let encryptedText = Buffer.from(text, 'base64');
            let decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (e: any) {
            return 'Decryption failed: ' + e.message;
        }
    }

    encryptApiFullResponse(text: string): string {
        try {
            if (!text) return '';
            const cipher = crypto.createCipheriv(this.algorithm, this.idEncryptionKey, this.idEncryptionIv);
            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return encrypted;
        } catch (e: any) {
            return '';
        }
    }

    async decryptApiFullRequest(text: string): Promise<string> {
        try {
            if (!text) return '';
            let encryptedText = Buffer.from(text, 'base64');
            let decipher = crypto.createDecipheriv(this.algorithm, this.idEncryptionKey, this.idEncryptionIv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (e: any) {
            return 'Decryption failed: ' + e.message;
        }
    }
}
