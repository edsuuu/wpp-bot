import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { MessageHandler } from "./handlers/message.handler";
import { getBotConfig } from "./config/bot.config";
import { DatabaseService } from "./services/database.service";
import { MinioService } from "./services/minio.service";
import { StickerService } from "./services/sticker.service";
import { WebService } from "./services/web.service";

export class WhatsAppBot {
    private client: Client;
    private messageHandler: MessageHandler;
    private db: DatabaseService;
    private minio: MinioService;
    private web: WebService;
    private stickerService: StickerService;

    constructor() {
        const config = getBotConfig();

        this.db = new DatabaseService();
        this.minio = new MinioService();
        this.web = new WebService(this.db);
        this.stickerService = new StickerService(this.minio, this.db);
        this.messageHandler = new MessageHandler(this.stickerService, this.web);

        this.client = new Client({
            authStrategy: new LocalAuth(),
            webVersion: "2.2412.54",
            webVersionCache: {
                type: "remote",
                remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
            },
            puppeteer: config.puppeteer,
            ffmpegPath: config.pathffmpeg,
        });

        this.setupEvents();
    }

    private setupEvents() {
        this.client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
        this.client.on("ready", () => console.log("[SERVER]: Bot Online!"));
        this.client.once("authenticated", () => console.log("[SERVER]: Autenticado com sucesso!"));
        this.client.on("message_create", (msg) => this.messageHandler.handle(msg));
    }

    public initialize() {
        this.client.initialize();
    }
}
