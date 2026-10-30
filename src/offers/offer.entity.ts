import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) productUrl!: string;
  @Column() title!: string;
  @Column() category!: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) currentPrice!: number;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) referencePrice!: number;
  @Column({ type: 'numeric', precision: 3, scale: 2 }) rating!: number;
  @Column() affiliateUrl!: string;
  @Column({ default: false }) approved!: boolean;
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 }) discountPercent!: number;
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" }) rejectionReasons!: string[];
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
