import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PriceSnapshot } from './price-snapshot.entity';

export enum MonitorType {
  ITEM = 'item',
  CATEGORY = 'category',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) marketplaceId!: string;
  @Column() title!: string;
  @Column({ nullable: true }) categoryId!: string;
  @Column({ type: 'enum', enum: MonitorType, default: MonitorType.ITEM }) monitorType!: MonitorType;
  @Column({ default: true }) active!: boolean;
  @OneToMany(() => PriceSnapshot, (snapshot) => snapshot.product) snapshots!: PriceSnapshot[];
  @CreateDateColumn() createdAt!: Date;
}
