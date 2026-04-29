# 🤖 WhatsApp Bot Sticker Maker

Um bot robusto e organizado para WhatsApp focado na criação de figurinhas (stickers), desenvolvido com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## 🚀 Funcionalidades

### 1. Criar Figurinha (Sticker)
Transforme imagens e vídeos em figurinhas instantaneamente.
- **Como usar:**
    - Envie uma imagem ou vídeo com a legenda `!figurinha`.
    - Ou responda (Reply) a uma imagem/vídeo já enviado com o comando `!figurinha`.
- **Personalização:**
    - Adicione texto após o comando para dar nome à figurinha. Ex: `!figurinha MeuPack`.

### 2. Comandos Utilitários
- `!ping`: Verifica se o bot está online.
- `!gerar`: (Opcional) Processa arquivos locais na pasta `stickers`.

---

## 🛠️ Instalação e Execução (Recomendado: Docker)

A maneira mais estável de rodar o bot é via Docker, pois ele já configura o ambiente com Chromium e FFmpeg.

1.  **Inicie o Bot:**
    ```bash
    npm run docker:up
    ```
2.  **Escaneie o QR Code:**
    O código aparecerá diretamente no seu terminal.
3.  **Parar o Bot:**
    ```bash
    npm run docker:down
    ```

### Execução Local (Alternativa)
Se preferir rodar sem Docker, instale o FFmpeg no seu sistema e execute:
```bash
pnpm install
pnpm run dev
```

---

## 🏗️ Arquitetura do Projeto

O projeto utiliza uma arquitetura organizada por responsabilidades:

- **`src/index.ts`**: Ponto de entrada da aplicação.
- **`src/bot.ts`**: Configuração do cliente WhatsApp e eventos globais.
- **`src/handlers/message.handler.ts`**: Gerenciamento de comandos e mensagens.
- **`src/services/sticker.service.ts`**: Lógica de download e conversão de mídias.
- **`src/config/bot.config.ts`**: Centralização de caminhos (FFmpeg/Chrome) e ambiente.

---

## ⚠️ Requisitos
- **Docker** e **Docker Compose** (recomendado).
- **Node.js** (se rodar localmente).
- **FFmpeg** (se rodar localmente).

---

## 📁 Persistência
- `.wwebjs_auth/`: Armazena sua sessão para evitar novos escaneamentos de QR Code.
- `.wwebjs_cache/`: Cache de versões do WhatsApp Web para maior estabilidade.
