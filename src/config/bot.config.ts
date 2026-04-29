import { existsSync } from "fs";

export const getBotConfig = () => {
    const isDocker = existsSync("/usr/bin/chromium") || existsSync("/usr/bin/ffmpeg");
    
    const linuxFFmpeg = "/usr/bin/ffmpeg";
    const macFFmpeg = "/opt/homebrew/bin/ffmpeg";
    
    const pathffmpeg = existsSync(linuxFFmpeg) ? linuxFFmpeg : (existsSync(macFFmpeg) ? macFFmpeg : "ffmpeg");

    return {
        isDocker,
        pathffmpeg,
        puppeteer: {
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
            executablePath: isDocker ? "/usr/bin/chromium" : undefined,
        }
    };
};
