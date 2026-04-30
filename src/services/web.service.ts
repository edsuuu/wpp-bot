import express from "express";
import { spawn, ChildProcess } from "child_process";
import { config } from "../config/env.config";
import { DatabaseService } from "./database.service";

const TUNNEL_DURATION_MS = 5 * 60 * 1000; // 5 minutos

export class WebService {
    private app = express();
    private db: DatabaseService;
    private server: any = null;
    private tunnelProcess: ChildProcess | null = null;
    private publicUrl: string = "";
    private isStarted: boolean = false;
    private expiresAt: number = 0;

    constructor(db: DatabaseService) {
        this.db = db;
        this.setupRoutes();
    }

    public async stop() {
        if (this.tunnelProcess) {
            this.tunnelProcess.kill();
            this.tunnelProcess = null;
        }
        if (this.server) {
            try { this.server.close(); } catch {}
            this.server = null;
        }
        this.isStarted = false;
        this.publicUrl = "";
        this.expiresAt = 0;
        console.log("[WEB]: Galeria fechada após o tempo limite.");
    }

    public getIsStarted(): boolean {
        return this.isStarted;
    }

    public getUrl(): string {
        return this.publicUrl;
    }

    public getMinutesLeft(): number {
        if (!this.expiresAt) return 0;
        return Math.max(0, Math.ceil((this.expiresAt - Date.now()) / 60000));
    }

    /** Verifica se o túnel ainda responde e reinicia se necessário */
    public async getOrRefreshUrl(): Promise<string> {
        const isAlive = this.isStarted && this.tunnelProcess && !this.tunnelProcess.killed && Date.now() < this.expiresAt;

        if (isAlive && this.publicUrl) {
            return this.publicUrl;
        }

        // Túnel morto ou expirado — abre novo
        if (this.isStarted) await this.stop();
        await this.start();

        // Aguarda propagação global do Cloudflare
        await new Promise((r) => setTimeout(r, 3000));

        return this.publicUrl;
    }

    private openCloudflaredTunnel(): Promise<string> {
        return new Promise((resolve, reject) => {
            const proc = spawn("cloudflared", [
                "tunnel", "--url", `http://localhost:${config.web.port}`, "--no-autoupdate"
            ]);

            this.tunnelProcess = proc;

            const timeout = setTimeout(() => reject(new Error("Timeout ao abrir túnel Cloudflare")), 30000);

            const onData = (data: Buffer) => {
                const line = data.toString();
                const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
                if (match) {
                    clearTimeout(timeout);
                    resolve(match[0]);
                }
            };

            proc.stdout?.on("data", onData);
            proc.stderr?.on("data", onData);

            proc.on("error", (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    private setupRoutes() {
        this.app.get("/", async (req, res) => {
            const userId = req.query.user as string;
            const stickers = await this.db.getAllStickers(userId);

            const html = `
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8">
                    <title>Galeria de Figurinhas</title>
                    <style>
                        body { font-family: sans-serif; background: #121212; color: white; text-align: center; }
                        .container { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 20px; }
                        .card { background: #1e1e1e; border-radius: 10px; padding: 15px; width: 200px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); }
                        img { max-width: 100%; border-radius: 5px; }
                        h1 { color: #25D366; }
                        .filter { margin-bottom: 20px; }
                        input { padding: 8px; border-radius: 5px; border: none; }
                        button { padding: 8px 15px; border-radius: 5px; border: none; background: #25D366; color: white; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <h1>🖼️ Galeria de Figurinhas</h1>
                    <div class="filter">
                        <form action="/" method="get">
                            <input type="text" name="user" placeholder="Filtrar por ID de Usuário" value="${userId || ''}">
                            <button type="submit">Filtrar</button>
                            <a href="/" style="color: #aaa; margin-left: 10px;">Limpar</a>
                        </form>
                    </div>
                    <div class="container">
                        ${stickers.map(s => `
                            <div class="card">
                                <img src="data:${s.mimetype};base64,${s.base64}" alt="Sticker">
                                <p><small>${s.user_name}</small></p>
                                <p><small>${new Date(s.created_at).toLocaleString()}</small></p>
                            </div>
                        `).join('')}
                        ${stickers.length === 0 ? '<p>Nenhuma figurinha encontrada.</p>' : ''}
                    </div>
                </body>
                </html>
            `;
            res.send(html);
        });
    }

    public async start(): Promise<void> {
        if (this.isStarted) return;

        return new Promise((resolve) => {
            this.server = this.app.listen(config.web.port, async () => {
                this.isStarted = true;
                console.log(`[WEB]: Servidor local rodando na porta ${config.web.port}`);

                try {
                    console.log("[WEB]: Abrindo túnel Cloudflare...");
                    const url = await this.openCloudflaredTunnel();

                    this.publicUrl = url;
                    this.expiresAt = Date.now() + TUNNEL_DURATION_MS;
                    console.log(`[WEB]: Galeria disponível em: ${this.publicUrl}`);

                    // Fecha após 5 minutos
                    setTimeout(() => this.stop(), TUNNEL_DURATION_MS);
                } catch (err: any) {
                    console.error("[WEB]: Erro ao abrir túnel Cloudflare:", err.message);
                }

                resolve();
            });
        });
    }
}
