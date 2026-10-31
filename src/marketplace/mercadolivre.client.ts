import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { MercadoLivreTokenStore } from './mercadolivre-token.store';

export interface MercadoLivreItem {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  permalink: string;
  category_id: string;
  seller?: { id: number };
}

@Injectable()
export class MercadoLivreClient {
  private readonly baseUrl = 'https://api.mercadolibre.com';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly tokens: MercadoLivreTokenStore,
  ) {}

  private headers() {
    const token = this.tokens.accessToken() ?? this.config.get<string>('ML_ACCESS_TOKEN');
    if (!token) {
      throw new Error('ML_ACCESS_TOKEN ausente. Autorize a aplicação via OAuth antes da consulta.');
    }
    return { Authorization: `Bearer ${token}` };
  }

  async validateAccess(): Promise<{ id: number; nickname: string }> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/users/me`, { headers: this.headers() }),
    );
    return data;
  }

  async search(query: string, limit = 20): Promise<MercadoLivreItem[]> {
    const siteId = this.config.get('ML_SITE_ID', 'MLB');
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/sites/${siteId}/search`, {
        headers: this.headers(),
        params: { q: query, limit },
      }),
    );
    return data.results;
  }

  async getItem(itemId: string): Promise<MercadoLivreItem> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/items/${encodeURIComponent(itemId)}`, {
        headers: this.headers(),
      }),
    );
    return data;
  }
}
