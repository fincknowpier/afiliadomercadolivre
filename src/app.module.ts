import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { OffersModule } from './offers/offers.module';
import { CreateOffers1793310000000 } from './migrations/1793310000000-CreateOffers';
import { ProductsModule } from './products/products.module';
import { RulesModule } from './rules/rules.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        migrations: [CreateOffers1793310000000],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    MarketplaceModule,
    ProductsModule,
    RulesModule,
    TelegramModule,
    MonitoringModule,
    OffersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
