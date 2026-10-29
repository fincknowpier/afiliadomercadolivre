import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceSnapshot } from './price-snapshot.entity';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, PriceSnapshot])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
