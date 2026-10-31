import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOfferPriceHistory1793396400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('offer_price_history')) return;
    await queryRunner.createTable(new Table({
      name: 'offer_price_history',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'gen_random_uuid()' },
        { name: 'offerId', type: 'uuid' },
        { name: 'price', type: 'numeric', precision: 12, scale: 2 },
        { name: 'recordedAt', type: 'timestamptz', default: 'now()' },
      ],
      foreignKeys: [{
        name: 'FK_offer_price_history_offer',
        columnNames: ['offerId'],
        referencedTableName: 'offers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }],
    }));
    await queryRunner.createIndex('offer_price_history', new TableIndex({
      name: 'IDX_offer_price_history_offer_date',
      columnNames: ['offerId', 'recordedAt'],
    }));
    await queryRunner.query(`
      INSERT INTO "offer_price_history" ("offerId", "price", "recordedAt")
      SELECT "id", "currentPrice", "updatedAt" FROM "offers"
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('offer_price_history', true);
  }
}
