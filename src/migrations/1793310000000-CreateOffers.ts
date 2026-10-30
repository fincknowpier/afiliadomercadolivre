import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOffers1793310000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('offers')) return;
    await queryRunner.createTable(new Table({
      name: 'offers',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
        { name: 'productUrl', type: 'varchar', isUnique: true },
        { name: 'title', type: 'varchar' },
        { name: 'category', type: 'varchar' },
        { name: 'currentPrice', type: 'numeric', precision: 12, scale: 2 },
        { name: 'referencePrice', type: 'numeric', precision: 12, scale: 2 },
        { name: 'rating', type: 'numeric', precision: 3, scale: 2 },
        { name: 'affiliateUrl', type: 'varchar' },
        { name: 'approved', type: 'boolean', default: false },
        { name: 'discountPercent', type: 'numeric', precision: 5, scale: 2, default: 0 },
        { name: 'rejectionReasons', type: 'jsonb', default: "'[]'::jsonb" },
        { name: 'createdAt', type: 'timestamp', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp', default: 'now()' },
      ],
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('offers', true);
  }
}
