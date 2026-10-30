import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesModule } from '../rules/rules.module';
import { Offer } from './offer.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer]), RulesModule],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
