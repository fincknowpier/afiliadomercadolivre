import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { OfferInput, OffersService } from './offers.service';

@Controller('api/offers')
@UseGuards(AdminGuard)
export class OffersController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  list() {
    return this.offers.list();
  }

  @Post('import')
  import(@Body() body: { offers: OfferInput[] }) {
    return this.offers.import(body.offers);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { preco_atual: number | string; preco_anterior: number | string; url_afiliado?: string },
  ) {
    return this.offers.update(id, body);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.offers.priceHistory(id);
  }
}
