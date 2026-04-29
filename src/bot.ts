import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { MessageHandler } from "./handlers/message.handler";
import { getBotConfig } from "./config/bot.config";

export class WhatsAppBot {
    private client: Client;
    private messageHandler: MessageHandler;

    constructor() {
        const config = getBotConfig();
        this.messageHandler = new MessageHandler();

        this.client = new Client({
            authStrategy: new LocalAuth(),
            webVersion: '2.2412.54',
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
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
        this.client.on("loading_screen", (p, m) => console.log("LOADING", p, m));
        
        this.client.on("message_create", (msg) => this.messageHandler.handle(msg));
    }

    public initialize() {
        this.client.initialize();
    }
}
