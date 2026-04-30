import dotenv from "dotenv";
dotenv.config();

export const config = {
    database: {
        host: process.env.DB_HOST || "host.docker.internal",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "root",
        database: process.env.DB_NAME || "wpp_bot",
    },
    minio: {
        endPoint: process.env.MINIO_ENDPOINT || "host.docker.internal",
        port: parseInt(process.env.MINIO_PORT || "9000"),
        useSSL: process.env.MINIO_SSL === "true",
        accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
        secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
        bucket: process.env.MINIO_BUCKET || "stickers",
    },
    web: {
        port: parseInt(process.env.WEB_PORT || "3000"),
        url: process.env.WEB_URL || "http://localhost:3000",
    }
};
