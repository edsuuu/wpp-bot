import { WhatsAppBot } from "./bot";

process.on("uncaughtException", (err) => {
    if (err.message.includes("socket hang up") || (err as any).code === "ECONNRESET") return;
    console.error("[FATAL]:", err.message);
});

process.on("unhandledRejection", (reason: any) => {
    const msg = reason?.message || String(reason);
    if (msg.includes("socket hang up") || reason?.code === "ECONNRESET") return;
    console.error("[FATAL]:", msg);
});

const bot = new WhatsAppBot();
bot.initialize();