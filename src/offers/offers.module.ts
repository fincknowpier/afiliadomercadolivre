import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesModule } from '../rules/rules.module';
import { Offer } from './offer.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { AdminGuard } from './admin.guard';
import { OfferPriceHistory } from './offer-price-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, OfferPriceHistory]), RulesModule],
  controllers: [OffersController],
  providers: [OffersService, AdminGuard],
})
export class OffersModule {}
