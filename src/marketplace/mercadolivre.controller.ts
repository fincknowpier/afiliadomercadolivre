import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../offers/admin.guard';
import { MercadoLivreClient } from './mercadolivre.client';

@Controller('api/mercadolivre')
@UseGuards(AdminGuard)
export class MercadoLivreController {
  constructor(private readonly client: MercadoLivreClient) {}

  @Post('resolve')
  async resolve(@Body() body: { url?: string }) {
    if (!body.url) throw new BadRequestException('Informe a URL do produto.');

    const decoded = decodeURIComponent(body.url);
    const itemId = decoded.match(/item_id[:=](MLB\d+)/i)?.[1]
      ?? decoded.match(/\b(MLB\d{8,})\b/i)?.[1];
    const productId = decoded.match(/\/p\/(MLB\d+)/i)?.[1];

    if (!itemId) {
      throw new BadRequestException('Não foi possível identificar o código do anúncio na URL.');
    }

    const item = await this.client.getItem(itemId.toUpperCase());
    return {
      source: 'mercadolivre-official-api',
      itemId: item.id,
      productId: productId?.toUpperCase(),
      title: item.title,
      price: item.price,
      originalPrice: item.original_price,
      permalink: item.permalink,
      categoryId: item.category_id,
    };
  }
}
