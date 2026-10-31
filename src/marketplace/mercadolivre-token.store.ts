import { Injectable } from '@nestjs/common';

export interface MercadoLivreToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  user_id: number;
}

@Injectable()
export class MercadoLivreTokenStore {
  private token?: MercadoLivreToken;
  private expiresAt?: number;

  set(token: MercadoLivreToken) {
    this.token = token;
    this.expiresAt = Date.now() + token.expires_in * 1000;
  }

  accessToken(): string | undefined {
    return this.token?.access_token;
  }

  status() {
    return {
      authorized: Boolean(this.token?.access_token),
      userId: this.token?.user_id,
      expiresAt: this.expiresAt ? new Date(this.expiresAt).toISOString() : undefined,
      persistence: 'memory',
    };
  }
}
