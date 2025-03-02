## 📌 Funcionalidades

- **Criar Figurinhas**: Envie uma imagem ou vídeo com a legenda `!figurinha` para criar uma figurinha automaticamente.
- **Consultar Temperatura**: Utilize o comando `!tempo NomeDaCidade` para obter a temperatura atual de uma cidade específica.
- **Cotação de Moedas**: Com o comando `!moeda`, obtenha a cotação atual do Dólar e do Bitcoin.

## 📦 Instalação

### Pré-requisitos

- Node 20 & npm
- `ffmpeg` instalado (necessário para figurinhas de vídeo)

### Passos

1. Clone o repositório:
   ```sh
   git clone https://github.com/seu-usuario/whatsapp-bot.git
   cd whatsapp-bot
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Crie um arquivo `.env` e configure sua chave de API do WeatherAPI:
   ```sh
   API_KEY_WEATHER=SUA_CHAVE_AQUI
   ```
4. Inicie o bot:
   ```sh
   npm run dev
   ```

## ⚙️ Como Usar

1. &#x20;QR Code será exibido no terminal.
2. Escaneie o QR Code utilizando o WhatsApp

## 📜 Comandos Disponíveis

| Comando                | Descrição                                                   |
| ---------------------- | ----------------------------------------------------------- |
| `!figurinha, !sticker`  | Cria uma figurinha a partir de uma imagem ou vídeo enviado. |
| `!tempo NomeDaCidade`  | Consulta a temperatura atual da cidade informada.           |
| `!moeda, !dolar`       | Obtém a cotação atual do Dólar e do Bitcoin.                |

## 🛠 Configuração do FFmpeg

O bot detecta automaticamente o caminho do `ffmpeg` dependendo do sistema operacional:

- **macOS**: `/usr/local/bin/ffmpeg`
- **Windows**: `C:\ffmpeg\bin\ffmpeg.exe`
- **Linux**: `/usr/bin/ffmpeg`

Caso seu `ffmpeg` esteja em outro local, modifique a função `searchFfmepForGenerateStickerImage()` no código.

##