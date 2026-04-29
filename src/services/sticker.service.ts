import { Message, MessageMedia } from "whatsapp-web.js";

export class StickerService {
    public async generate(message: Message, nameSticker: string): Promise<void> {
        const targetMessage = message.hasQuotedMsg ? await message.getQuotedMessage() : message;

        if (targetMessage.type === "image" || targetMessage.type === "video") {
            console.log(`[STICKER]: Gerando figurinha para ${message.from}...`);
            await message.reply("🛠️ [SERVER]: Criando sua figurinha... ⏳");

            const data = await targetMessage.downloadMedia();
            const media = new MessageMedia(
                data.mimetype,
                data.data,
                targetMessage.type === "image" ? "image.jpg" : "video.mp4"
            );

            const chat = await message.getChat();
            await chat.sendMessage(media, {
                sendMediaAsSticker: true,
                stickerName: nameSticker,
            });
            console.log(`[STICKER]: Figurinha enviada com sucesso para ${message.from}`);
        } else {
            await message.reply("📌 [SERVER]: Envie uma *imagem* ou *vídeo* com !figurinha");
        }
    }
}
