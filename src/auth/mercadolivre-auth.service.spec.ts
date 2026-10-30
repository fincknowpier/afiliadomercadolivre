import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
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
});
