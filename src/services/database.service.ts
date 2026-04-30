import * as mysql from "mysql2/promise";
import { config } from "../config/env.config";

export class DatabaseService {
    private connection: mysql.Pool | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        try {
            const conn = await mysql.createConnection({
                host: config.database.host,
                user: config.database.user,
                password: config.database.password,
            });

            await conn.query(`CREATE DATABASE IF NOT EXISTS ${config.database.database}`);
            await conn.end();

            this.connection = mysql.createPool(config.database);

            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS stickers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(255),
                    user_name VARCHAR(255),
                    mimetype VARCHAR(100),
                    base64 LONGTEXT,
                    minio_key VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("[DATABASE]: Conectado e tabelas verificadas.");
        } catch (err: any) {
            console.error("[DATABASE]: Erro na inicialização:", err.message);
        }
    }

    public async saveSticker(data: {
        user_id: string;
        user_name: string;
        mimetype: string;
        base64: string;
        minio_key: string;
    }) {
        if (!this.connection) return;
        await this.connection.execute(
            "INSERT INTO stickers (user_id, user_name, mimetype, base64, minio_key) VALUES (?, ?, ?, ?, ?)",
            [data.user_id, data.user_name, data.mimetype, data.base64, data.minio_key]
        );
    }

    public async getAllStickers(userId?: string): Promise<any[]> {
        if (!this.connection) return [];
        const [rows] = userId
            ? await this.connection.execute("SELECT * FROM stickers WHERE user_id = ? ORDER BY created_at DESC", [userId])
            : await this.connection.execute("SELECT * FROM stickers ORDER BY created_at DESC");
        return rows as any[];
    }
}
