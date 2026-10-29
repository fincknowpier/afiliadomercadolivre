import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MercadoLivreClient } from './mercadolivre.client';

@Module({
  imports: [HttpModule.register({ timeout: 10_000 })],
  providers: [MercadoLivreClient],
  exports: [MercadoLivreClient],
})
export class MarketplaceModule {}
