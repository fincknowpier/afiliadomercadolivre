import { HttpService } from '@nestjs/axios';
import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { firstValueFrom } from 'rxjs';

interface PendingAuthorization {
  codeVerifier?: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user_id: number;
}

@Injectable()
export class MercadoLivreAuthService {
  private readonly pending = new Map<string, PendingAuthorization>();

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  createAuthorizationUrl(): string {
    this.removeExpiredStates();
    const clientId = this.config.getOrThrow<string>('ML_CLIENT_ID');
    const redirectUri = this.config.getOrThrow<string>('ML_REDIRECT_URI');
    const state = randomBytes(32).toString('base64url');
    const usePkce = this.config.get('ML_OAUTH_USE_PKCE', 'true') === 'true';
    const codeVerifier = usePkce ? randomBytes(64).toString('base64url') : undefined;

    this.pending.set(state, { codeVerifier, expiresAt: Date.now() + 10 * 60_000 });

    const url = new URL('https://auth.mercadolivre.com.br/authorization');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    if (codeVerifier) {
      const challenge = createHash('sha256').update(codeVerifier).digest('base64url');
      url.searchParams.set('code_challenge', challenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }
    return url.toString();
  }

  async completeAuthorization(input: { code?: string; state?: string; error?: string }) {
    if (input.error) throw new BadRequestException(`Autorização recusada: ${input.error}`);
    if (!input.code || !input.state) throw new BadRequestException('Callback sem code ou state.');

    const pending = this.pending.get(input.state);
    this.pending.delete(input.state);
    if (!pending || pending.expiresAt < Date.now()) {
      throw new BadRequestException('State inválido ou expirado. Inicie novamente o OAuth.');
    }

    const token = await this.exchangeCode(input.code, pending.codeVerifier);
    const account = await this.validateToken(token.access_token);
    return { token, account, expiresIn: token.expires_in };
  }

  private async exchangeCode(code: string, codeVerifier?: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.getOrThrow<string>('ML_CLIENT_ID'),
      client_secret: this.config.getOrThrow<string>('ML_CLIENT_SECRET'),
      code,
      redirect_uri: this.config.getOrThrow<string>('ML_REDIRECT_URI'),
    });
    if (codeVerifier) body.set('code_verifier', codeVerifier);

    try {
      const { data } = await firstValueFrom(
        this.http.post<TokenResponse>('https://api.mercadolibre.com/oauth/token', body.toString(), {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        }),
      );
      return data;
    } catch {
      throw new BadGatewayException('Falha ao trocar o código OAuth por token no Mercado Livre.');
    }
  }

  private async validateToken(accessToken: string): Promise<{ id: number; nickname: string }> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ id: number; nickname: string }>('https://api.mercadolibre.com/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return data;
    } catch {
      throw new BadGatewayException('Token recebido, mas a validação em /users/me falhou.');
    }
  }

  private removeExpiredStates() {
    const now = Date.now();
    for (const [state, pending] of this.pending) {
      if (pending.expiresAt < now) this.pending.delete(state);
    }
  }
}
