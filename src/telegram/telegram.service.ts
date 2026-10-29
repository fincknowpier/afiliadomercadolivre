import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get('TELEGRAM_BOT_TOKEN') && this.config.get('TELEGRAM_CHAT_ID'));
  }

  async notify(_message: string): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Telegram não configurado; alerta não enviado.');
      return;
    }
    throw new Error('Envio ao Telegram ainda não habilitado: valide o bot e o chat privado primeiro.');
  }
}
