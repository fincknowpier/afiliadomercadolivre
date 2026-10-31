import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AdminGuard } from '../offers/admin.guard';
import { MercadoLivreController } from './mercadolivre.controller';
import { MercadoLivreClient } from './mercadolivre.client';
import { MercadoLivreTokenStore } from './mercadolivre-token.store';

@Module({
  imports: [HttpModule.register({ timeout: 10_000 })],
  controllers: [MercadoLivreController],
  providers: [MercadoLivreClient, MercadoLivreTokenStore, AdminGuard],
  exports: [MercadoLivreClient, MercadoLivreTokenStore],
})
export class MarketplaceModule {}
