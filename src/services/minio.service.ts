import * as Minio from "minio";
import { config } from "../config/env.config";

export class MinioService {
    private client: Minio.Client;

    constructor() {
        this.client = new Minio.Client({
            endPoint: config.minio.endPoint,
            port: config.minio.port,
            useSSL: config.minio.useSSL,
            accessKey: config.minio.accessKey,
            secretKey: config.minio.secretKey,
            pathStyle: true
        });
        this.checkConnection();
    }

    private async checkConnection() {
        try {
            const bucketExists = await this.client.bucketExists(config.minio.bucket);
            if (!bucketExists) {
                await this.client.makeBucket(config.minio.bucket);
            }
            console.log(`[MINIO]: Conectado e bucket '${config.minio.bucket}' pronto.`);
        } catch (err: any) {
            console.error(`[MINIO]: Erro de conexão detalhado:`, err);
        }
    }

    public async upload(fileName: string, buffer: Buffer, mimetype: string): Promise<string> {
        const key = `${Date.now()}-${fileName}`;
        await this.client.putObject(config.minio.bucket, key, buffer, buffer.length, {
            "Content-Type": mimetype,
        });
        return key;
    }

    public async getUrl(key: string): Promise<string> {
        // Gera uma URL que expira em 1 hora
        return await this.client.presignedGetObject(config.minio.bucket, key, 3600);
    }
}
