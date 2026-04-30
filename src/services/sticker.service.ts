import { Message, MessageMedia } from "whatsapp-web.js";
import { MinioService } from "./minio.service";
import { DatabaseService } from "./database.service";

export class StickerService {
    private minio: MinioService;
    private db: DatabaseService;

    constructor(minio: MinioService, db: DatabaseService) {
        this.minio = minio;
        this.db = db;
    }

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
            await chat.sendMessage(media, { sendMediaAsSticker: true, stickerName: nameSticker });
            console.log(`[STICKER]: Figurinha enviada para ${message.from}`);

            this.persist(message, data).catch(() => {});
        } else {
            await message.reply("📌 [SERVER]: Envie uma *imagem* ou *vídeo* com !figurinha");
        }
    }

    private async persist(message: Message, data: any): Promise<void> {
        try {
            const buffer = Buffer.from(data.data, "base64");
            const contact = await message.getContact();

            const minioKey = await this.minio.upload(`sticker-${message.id.id}`, buffer, data.mimetype);
            console.log(`[MINIO]: Upload concluído (${minioKey})`);

            await this.db.saveSticker({
                user_id: message.from,
                user_name: contact.pushname || contact.name || "Desconhecido",
                mimetype: data.mimetype,
                base64: data.data,
                minio_key: minioKey,
            });
            console.log(`[DATABASE]: Registro salvo para ${message.from}`);
        } catch (err: any) {
            console.error("[PERSISTENCE ERROR]:", err.message);
        }
    }
}
