import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
