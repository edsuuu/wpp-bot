# 🤖 WhatsApp Bot Sticker Maker

Um bot simples e eficiente para WhatsApp focado na criação de figurinhas (stickers), desenvolvido com [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## 🚀 Funcionalidades

### 1. Criar Figurinha Individual

Transforme imagens e vídeos em figurinhas instantaneamente.

- **Como usar:**
    - Envie uma imagem ou vídeo com a legenda `!figurinha` ou `!sticker`.
    - Ou responda a uma imagem/vídeo já enviado com o comando.
- **Personalização:**
    - Você pode dar nome à figurinha adicionando texto após o comando.
    - Exemplo: `!figurinha MeuPack` (A figurinha terá o nome de pacote "MeuPack").

### 2. Gerar Figurinhas em Massa (Por Pasta)

Esta é uma funcionalidade poderosa para criar múltiplos stickers de uma vez a partir de arquivos locais.

- **Como usar:**
    1. Envie o comando `!gerar`.
    2. Se a pasta `stickers` não existir na raiz do projeto, o bot irá criá-la automaticamente e avisar você.
    3. Coloque seus arquivos de imagem ou vídeo (`.jpg`, `.jpeg`, `.png`, `.mp4`) dentro desta pasta `stickers`.
    4. Envie o comando `!gerar` novamente.
    5. O bot irá processar todos os arquivos da pasta e enviá-los como figurinhas para você.

### 3. Ping

Verifique se o bot está online e respondendo.

- **Comando:** `!ping`
- **Resposta:** `pong`

## 🛠️ Instalação e Execução

1.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

2.  **Inicie o bot:**

    ```bash
    pnpm run dev
    ```

3.  **Autenticação:**
    - Um QR Code será exibido no terminal.
    - Abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" > "Conectar um aparelho" e escaneie o código.

## 📁 Estrutura de Pastas

- `src/`: Código fonte do bot.
- `stickers/`: Pasta local onde o bot busca arquivos para o comando `!gerar`. (Criada automaticamente)
- `.wwebjs_auth/`: Armazena a sessão do WhatsApp para não precisar escanear o QR Code toda vez.

## ⚠️ Requisitos

- **Node.js** (versão LTS recomendada)
- **FFmpeg** instalado no sistema (necessário para conversão de vídeos/GIFs em figurinhas animadas).
    - O bot espera encontrar o FFmpeg em `/usr/bin/ffmpeg`. Se estiver em outro local, ajuste a variável `pathffmpeg` no arquivo `src/index.ts`.
