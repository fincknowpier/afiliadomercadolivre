import { Body, Controller, Get, Post } from '@nestjs/common';
import { OfferInput, OffersService } from './offers.service';

@Controller('api/offers')
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
}
