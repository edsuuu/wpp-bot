import { Message } from "whatsapp-web.js";
import { StickerService } from "../services/sticker.service";

export class MessageHandler {
    private stickerService: StickerService;

    constructor() {
        this.stickerService = new StickerService();
    }

    public async handle(message: Message): Promise<void> {
        if (message.body.startsWith('!')) {
            console.log(`[MSG]: ${message.from} -> ${message.body}`);
        }

        const body = message.body.toLowerCase();

        if (body.startsWith("!figurinha") || body.startsWith("!sticker")) {
            const name = message.body.split(" ").slice(1).join(" ") || "Sticker";
            await this.stickerService.generate(message, name);
        }

        if (body === "!ping") {
            await message.reply("pong");
        }
    }
}
