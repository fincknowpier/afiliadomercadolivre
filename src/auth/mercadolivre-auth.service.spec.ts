import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { MercadoLivreAuthService } from './mercadolivre-auth.service';

describe('MercadoLivreAuthService', () => {
  const config = new ConfigService({
    ML_CLIENT_ID: '5938730542536945',
    ML_REDIRECT_URI: 'https://radar-promocoes-api.onrender.com/auth/mercadolivre/callback',
    ML_OAUTH_USE_PKCE: 'true',
  });
  const service = new MercadoLivreAuthService({} as HttpService, config);

  it('cria URL oficial com state e PKCE', () => {
    const url = new URL(service.createAuthorizationUrl());
    expect(url.origin).toBe('https://auth.mercadolivre.com.br');
    expect(url.searchParams.get('client_id')).toBe('5938730542536945');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://radar-promocoes-api.onrender.com/auth/mercadolivre/callback',
    );
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
  });

  it('retorna somente os dados mínimos da conta validada', async () => {
    const http = {
      post: jest.fn().mockReturnValue(of({
        data: { access_token: 'access-token', expires_in: 21600, user_id: 10491471 },
      })),
      get: jest.fn().mockReturnValue(of({
        data: {
          id: 10491471,
          nickname: 'FINCKNOWPIER',
          email: 'nao-deve-ser-exposto@example.com',
          identification: { type: 'CPF', number: '00000000000' },
        },
      })),
    } as unknown as HttpService;
    const secureConfig = new ConfigService({
      ML_CLIENT_ID: '5938730542536945',
      ML_CLIENT_SECRET: 'secret',
      ML_REDIRECT_URI: 'https://radar-promocoes-api.onrender.com/auth/mercadolivre/callback',
      ML_OAUTH_USE_PKCE: 'false',
    });
    const secureService = new MercadoLivreAuthService(http, secureConfig);
    const authorizationUrl = new URL(secureService.createAuthorizationUrl());

    const result = await secureService.completeAuthorization({
      code: 'authorization-code',
      state: authorizationUrl.searchParams.get('state')!,
    });

    expect(result.account).toEqual({ id: 10491471, nickname: 'FINCKNOWPIER' });
    expect(result.account).not.toHaveProperty('email');
    expect(result.account).not.toHaveProperty('identification');
  });
});
