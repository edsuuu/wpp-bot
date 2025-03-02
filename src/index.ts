import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import axios from "axios";
import dotnev from "dotenv";

dotnev.config();
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

    private generateConnection(): void {
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
            if (
                message.body === "!comandos" ||
                message.body === "!help" ||
                message.body === "!ajuda"
            ) {
                message.reply(
                    `🌟 *Comandos do BOT* 🌟\n\n` +
                        `📌 *Criar Figurinha*\n` +
                        `Envie uma imagem ou vídeo com a legenda:\n` +
                        `👉 *!figurinha* (gera uma figurinha automática)\n` +
                        `👉 *!figurinha NomeDaFigurinha* (personaliza o nome da figurinha)\n\n` +
                        `🌡️ *Consultar Temperatura*\n` +
                        `Envie o comando seguido do nome da cidade:\n` +
                        `🌍 Exemplo: *!tempo São Paulo*\n\n` +
                        `💰 *Cotação de Moedas*\n` +
                        `Consulte o valor atual do Dólar e do Bitcoin:\n` +
                        `💵 Exemplo: *!moeda*\n\n`
                );
            }

            if (/^!figurinha(?:\s|$)/.test(message.body)) {
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

            if (/^!tempo(?:\s|$)/.test(message.body)) {
                const regex = /!tempo\s*(.*)/;

                const match = message.body.trim()
                    ? message.body.match(regex)
                    : null;

                const city = match && match[1] ? match[1] : "itapevi";

                try {
                    const { data } = await axios.get(
                        `http://api.weatherapi.com/v1/current.json?key=${
                            process.env.API_KEY_WEATHER
                        }&q=${encodeURIComponent(city)}&aqi=no`
                    );

                    message.reply(
                        `🌡️ A temperatura em *${data.location.name.replace(
                            "San Paulo",
                            "São Paulo"
                        )}* é de *${data.current.temp_c}°C* 🌡️`
                    );
                } catch (error) {
                    message.reply(
                        `[SERVER]: ❌ Erro ao Responder temperatura! ${error}`
                    );
                }
            }

            if (
                message.body === "!moeda" ||
                message.body === "!dolar" ||
                message.body === "!bitcoin"
            ) {
                try {
                    const { data } = await axios.get(
                        "https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL"
                    );
                    const { USDBRL, BTCBRL } = data;

                    const formatDate = (dateString: string) => {
                        const date = new Date(dateString);
                        return date.toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        });
                    };

                    message.reply(
                        `💰 *COTAÇÃO ATUAL* 💰\n\n` +
                            `💵 *Dólar (USD/BRL)*\n` +
                            `   🔹 *Alta:* R$ ${parseFloat(USDBRL.high).toFixed(
                                3
                            )}\n` +
                            `   🔹 *Baixa:* R$ ${parseFloat(USDBRL.low).toFixed(
                                3
                            )}\n` +
                            `   ⏳ *Última atualização:* ${formatDate(
                                USDBRL.create_date
                            )}\n\n` +
                            `🪙 *Bitcoin (BTC/BRL)*\n` +
                            `   🔹 *Alta:* R$ ${parseFloat(
                                BTCBRL.high
                            ).toLocaleString("pt-BR")}\n` +
                            `   🔹 *Baixa:* R$ ${parseFloat(
                                BTCBRL.low
                            ).toLocaleString("pt-BR")}\n` +
                            `   ⏳ *Última atualização:* ${formatDate(
                                BTCBRL.create_date
                            )}\n\n` +
                            `🔄 *Valores atualizados em tempo real!*`
                    );
                } catch (error) {
                    console.log(error);
                    message.reply(
                        `[SERVER]: ❌ Erro ao Responder Moeda! ${error}`
                    );
                }
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

    private searchFfmepForGenerateStickerImage(): void {
        const osType = process.platform;

        switch (osType) {
            case "darwin":
                const pathMacOs = "/usr/local/bin/ffmpeg";
                this.pathffmpeg = pathMacOs;
                break;
            case "win32":
                const pathWindows = "C:\\ffmpeg\\bin\\ffmpeg.exe";
                this.pathffmpeg = pathWindows;
                console.log("Você está no Windows");
                break;
            case "linux":
                const pathLinux = "/usr/bin/ffmpeg";
                this.pathffmpeg = pathLinux;
                break;
        }
    }
}

new WhatsAppBot();