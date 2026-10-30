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

export interface MercadoLivreAccountResponse {
  id: number;
  nickname: string;
}

export interface MercadoLivreItemProof {
  id: string;
  title: string;
  categoryId: string;
  permalink: string;
  currencyId: string;
  price: number;
  originalPrice: number | null;
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
    const itemProof = await this.querySpecificItem(token.access_token);
    return { token, account, itemProof, expiresIn: token.expires_in };
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

  private async validateToken(accessToken: string): Promise<MercadoLivreAccountResponse> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<MercadoLivreAccountResponse & Record<string, unknown>>('https://api.mercadolibre.com/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return { id: data.id, nickname: data.nickname };
    } catch {
      throw new BadGatewayException('Token recebido, mas a validação em /users/me falhou.');
    }
  }

  private async querySpecificItem(accessToken: string): Promise<MercadoLivreItemProof> {
    const itemId = this.config.get('ML_POC_ITEM_ID', 'MLB5307984376');
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const { data: item } = await firstValueFrom(
        this.http.get<{
          id: string;
          title: string;
          category_id: string;
          permalink: string;
          currency_id: string;
          price: number;
          original_price: number | null;
        }>(`https://api.mercadolibre.com/items/${encodeURIComponent(itemId)}`, { headers }),
      );
      return {
        id: item.id,
        title: item.title,
        categoryId: item.category_id,
        permalink: item.permalink,
        currencyId: item.currency_id,
        price: item.price,
        originalPrice: item.original_price,
      };
    } catch {
      throw new BadGatewayException(`Token validado, mas a consulta do item ${itemId} falhou.`);
    }
  }

  private removeExpiredStates() {
    const now = Date.now();
    for (const [state, pending] of this.pending) {
      if (pending.expiresAt < now) this.pending.delete(state);
    }
  }
}
