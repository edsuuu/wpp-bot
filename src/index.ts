import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
class WhatsAppBot {
    private pathffmpeg: string;
    private client: Client;

    constructor() {
        this.pathffmpeg = "/usr/bin/ffmpeg";

        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ["--no-sandbox"],
            },
            ffmpegPath: this.pathffmpeg,
        });

        this.generateConnection();
        this.messagesReceived();
    }

    private generateConnection(): void {
        this.client.on("qr", (qr) => {
            qrcode.generate(qr, { small: true });
        });

        this.client.on("ready", () => {
            console.log("[SERVER]: Bot Online!");
        });

        this.client.initialize();
    }

    private async generateAllStickerWithFolder(message: Message) {

        const result: string[] = [];

        const folder = join(__dirname, "stickers");

        if (!existsSync(folder)) {
            mkdirSync(folder, { recursive: true });
            console.log("Pasta 'stickers' criada em: ", folder);
            message.reply("Pasta 'stickers' criada em: ", folder);
        }

        const itens = readdirSync(folder);

        if (itens.length === 0) {
            return message.reply('Adicione arquivos na Pasta: ', folder);
        }

        for (const item of itens) {
            const pathComplete = join(folder, item);
            result.push(pathComplete);
        }

        for (const arq of result) {
            try {
                const buffer = readFileSync(arq);
                const base64 = buffer.toString("base64");
                // automatizar para capturar o mimetype automatico
                // para gerar figurinha animada passar apenas video .mp4

                const mimeType = 'video/mp4' // passar o mimeTipe de image/jpg ou video/mp4
                const media = new MessageMedia(
                    mimeType,
                    base64,
                    "video.mp4" // passar o filename aq como image.jpg
                );

                const sender = message.from.startsWith(this.client.info.wid.user)
                    ? message.to
                    : message.from;

                const chatID = '@c.us' // passar o chat id seria o numero '551198654321@c.us' ou id do grupo '12312312312312@g.us'

                await this.client.sendMessage(sender, media, {
                    sendMediaAsSticker: true,
                    stickerName: 'sticker',
                });
            } catch (err) {
                console.error(`Erro ao converter ${arq}:`, err);
                return message.reply(`LINHA 85 Erro ao converter ${arq}:`);
            }
        }
    }

    private messagesReceived(): void {
        this.client.on("message_create", async (message: Message) => {

            if (/^!figurinha(?:\s|$)/.test(message.body) || /^!sticker(?:\s|$)/.test(message.body)) {
                console.log('Sticker', new Date())
                try {
                    const regex = /!figurinha\s*(.*)/;

                    const match = message.body.trim()
                        ? message.body.match(regex)
                        : null;

                    const nameSticker =
                        match && match[1] ? match[1] : "Sticker";

                    await this.generateSticker(message, nameSticker);
                } catch (error) {
                    console.log(error);
                    message.reply(
                        `[SERVER]: ❌ Erro ao gerar Sticker! ${error}`
                    );
                }
            }

            if (message.body == '!gerar') {
                try {
                    await this.generateAllStickerWithFolder(message)
                } catch (error) {
                    console.log(error);
                }
            }

            if (message.body == '!ping') {
                message.reply('pong');
            }

        });
    }

    private async generateSticker(
        message: Message,
        nameSticker: string
    ): Promise<void> {
        if (message.type === "image" || message.type === "video") {
            message.reply(
                `🛠️ [SERVER]: Criando sua figurinha... ⏳\nAguarde alguns segundos!`
            );

            const data = await message.downloadMedia();

            const media = new MessageMedia(
                data.mimetype,
                data.data,
                message.type === "image" ? "image.jpg" : "video.mp4"
            );

            const sender = message.from.startsWith(this.client.info.wid.user)
                ? message.to
                : message.from;

            await this.client.sendMessage(sender, media, {
                sendMediaAsSticker: true,
                stickerName: nameSticker,
            });
        } else if (message.type === "chat") {
            message.reply(
                `📌 [SERVER]: Para criar uma figurinha, envie uma *imagem* ou *vídeo* com a legenda:\n\n` +
                `👉 *!figurinha* (gera uma figurinha automática)\n` +
                `👉 *!figurinha NomeDaFigurinha* (personaliza o nome da figurinha)`
            );
        }
    }
}

new WhatsAppBot();