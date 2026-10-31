import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('offer_price_history')
@Index(['offerId', 'recordedAt'])
export class OfferPriceHistory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column('uuid') offerId!: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) price!: number;
  @CreateDateColumn({ type: 'timestamptz' }) recordedAt!: Date;
}
