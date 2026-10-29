import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('price_snapshots')
export class PriceSnapshot {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Product, (product) => product.snapshots, { onDelete: 'CASCADE' }) product!: Product;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) price!: number;
  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true }) rating!: number | null;
  @Column({ type: 'jsonb', nullable: true }) raw!: Record<string, unknown> | null;
  @CreateDateColumn() observedAt!: Date;
}
