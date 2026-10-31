import { Controller, Get, Query } from '@nestjs/common';
import { MercadoLivreAuthService } from './mercadolivre-auth.service';

@Controller('auth/mercadolivre')
export class MercadoLivreAuthController {
  constructor(private readonly auth: MercadoLivreAuthService) {}

  @Get('start')
  start() {
    return {
      authorizationUrl: this.auth.createAuthorizationUrl(),
      instructions: 'Abra authorizationUrl no navegador e autorize com a conta titular do Mercado Livre.',
    };
  }

  @Get('callback')
  async callback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const result = await this.auth.completeAuthorization({ code, state, error });
    return {
      status: 'VALIDADO',
      account: result.account,
      expiresInSeconds: result.expiresIn,
      tokenStored: 'memory',
      nextStep: 'Teste a consulta oficial do anúncio. Uma reinicialização exigirá nova autorização.',
    };
  }

  @Get('status')
  status() {
    return this.auth.authorizationStatus();
  }
}
