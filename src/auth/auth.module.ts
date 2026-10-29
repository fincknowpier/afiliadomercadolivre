import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MercadoLivreAuthController } from './mercadolivre-auth.controller';
import { MercadoLivreAuthService } from './mercadolivre-auth.service';

@Module({
  imports: [HttpModule.register({ timeout: 10_000 })],
  controllers: [MercadoLivreAuthController],
  providers: [MercadoLivreAuthService],
  exports: [MercadoLivreAuthService],
})
export class AuthModule {}
