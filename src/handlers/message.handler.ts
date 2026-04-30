import { Message } from "whatsapp-web.js";
import { StickerService } from "../services/sticker.service";
import { WebService } from "../services/web.service";

export class MessageHandler {
    private stickerService: StickerService;
    private webService: WebService;

    constructor(stickerService: StickerService, webService: WebService) {
        this.stickerService = stickerService;
        this.webService = webService;
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

        if (body === "!galeria") {
            await message.reply("⏳ Verificando galeria, aguarde...");

            const url = await this.webService.getOrRefreshUrl();

            if (!url) {
                await message.reply("❌ Não foi possível abrir a galeria agora. Tente novamente em instantes.");
                return;
            }

            const minutesLeft = this.webService.getMinutesLeft();

            const msg = `🖼️ *Galeria de Figurinhas*

🔗 ${url}

⏱️ *Disponível por mais ${minutesLeft} minuto(s)*`;

            await message.reply(msg);
        }

        if (body === "!help" || body === "!ajuda" || body === "!comandos") {
            const helpText = `
🤖 *WhatsApp Bot Sticker Maker*

Aqui estão os comandos disponíveis:

📌 *!figurinha* ou *!sticker*
Gera uma figurinha a partir de uma imagem ou vídeo.
_Dica: Você pode enviar a mídia com o comando ou responder a uma mídia antiga._

🖼️ *!galeria*
Receba o link para ver todas as figurinhas.
_Nota: A galeria fica disponível por 5 minutos por segurança._

🏓 *!ping*
Teste se o bot está online.

❓ *!help*
Mostra esta lista de comandos.
            `.trim();
            await message.reply(helpText);
        }

        if (body === "!ping") {
            await message.reply("pong");
        }
    }
}
