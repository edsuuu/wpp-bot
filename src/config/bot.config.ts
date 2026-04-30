import { existsSync } from "fs";

export const getBotConfig = () => {
    const isDocker = existsSync("/usr/bin/chromium") || existsSync("/usr/bin/ffmpeg");
    const pathffmpeg = existsSync("/usr/bin/ffmpeg")
        ? "/usr/bin/ffmpeg"
        : existsSync("/opt/homebrew/bin/ffmpeg")
        ? "/opt/homebrew/bin/ffmpeg"
        : "ffmpeg";

    return {
        isDocker,
        pathffmpeg,
        puppeteer: {
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--remote-debugging-port=9222",
            ],
            executablePath: isDocker ? "/usr/bin/chromium" : undefined,
        },
    };
};
