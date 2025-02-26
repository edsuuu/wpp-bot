import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";

class WhatsAppBot {
    private pathffmpeg: string;
    private client: Client;

    constructor() {
        this.pathffmpeg = "";
        this.searchFfmepForGenerateStickerImage();

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

    public generateConnection(): void {
        this.client.on("qr", (qr) => {
            qrcode.generate(qr, { small: true });
        });

        this.client.on("ready", () => {
            console.log("[SERVER]: Bot Online!");
        });

        this.client.initialize();
    }

    private messagesReceived(): void {
        this.client.on("message_create", async (message: Message) => {
            if (message.body.toLowerCase() === "figurinha") {
                try {
                    await this.generateSticker(message);
                } catch (error) {
                    console.log(error);
                    message.reply(
                        `[SERVER]: ❌ Erro ao gerar Sticker! ${error}`
                    );
                }
            }


        });
    }

    private async generateSticker(message: Message): Promise<void> {
        if (message.type === "image" || message.type === "video") {
            message.reply("[SERVER]: Gerando figurinha...");

            const data = await message.downloadMedia();

            const media = new MessageMedia(
                data.mimetype,
                data.data,
                message.type === "image" ? "image.jpg" : "video.mp4"
            );

            await this.client.sendMessage(message.to, media, {
                sendMediaAsSticker: true,
            });
        } else if (message.type === "chat") {
            message.reply(
                "[SERVER]: Paga gerar uma figurinha envie uma imagem ou video com a legenda: Figurinha"
            );
        }
    }

    private searchFfmepForGenerateStickerImage(): void {
        const osType = process.platform;

        switch (osType) {
            case "darwin":
                const pathMacOs = "/usr/local/bin/ffmpeg";
                this.pathffmpeg = pathMacOs;

                // if (fs.existsSync(pathMacOs)) {
                //     console.log("A pasta existe!");
                //     this.pathffmpeg = pathMacOs;
                // } else {
                //     // console.log("brew install webp && brew install ffmpeg");
                // }
                break;
            case "win32":
                console.log("Você está no Windows");
                break;
            case "linux":
                const pathLinux = "/usr/bin/ffmpeg";
                this.pathffmpeg = pathLinux;

                // if (fs.existsSync(pathLinux)) {
                //     console.log("A pasta existe!");
                //     this.pathffmpeg = pathLinux;
                // } else {
                //     // console.log("sudo apt install ffmpeg libwebp-dev");
                // }
                break;
            default:
                console.log("Sistema operacional desconhecido");
                break;
        }
    }
}

new WhatsAppBot();
