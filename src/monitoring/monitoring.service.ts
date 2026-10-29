import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  constructor(private readonly config: ConfigService) {}

  @Cron(process.env.MONITOR_CRON ?? '0 0 */3 * * *')
  async monitor(): Promise<void> {
    if (!this.config.get('ML_ACCESS_TOKEN')) {
      this.logger.warn('Ciclo ignorado: API Mercado Livre ainda não autorizada.');
      return;
    }
    this.logger.log('Ciclo iniciado; coletores serão habilitados após validar a PoC OAuth.');
  }
}
