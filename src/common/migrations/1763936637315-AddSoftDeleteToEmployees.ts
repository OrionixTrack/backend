import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToEmployees1763936637315
  implements MigrationInterface
{
  name = 'AddSoftDeleteToEmployees1763936637315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dispatcher" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "driver" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "dispatcher" DROP CONSTRAINT "UQ_cc646f300114854891ae417c6e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "driver" DROP CONSTRAINT "UQ_bb2050b01c92e5eb0ecee4c77fb"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dispatcher_email_active" ON "dispatcher" ("email") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_driver_email_active" ON "driver" ("email") WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_driver_email_active"`);
    await queryRunner.query(`DROP INDEX "IDX_dispatcher_email_active"`);
    await queryRunner.query(
      `ALTER TABLE "driver" ADD CONSTRAINT "UQ_bb2050b01c92e5eb0ecee4c77fb" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispatcher" ADD CONSTRAINT "UQ_cc646f300114854891ae417c6e2" UNIQUE ("email")`,
    );
    await queryRunner.query(`ALTER TABLE "driver" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "dispatcher" DROP COLUMN "deleted_at"`,
    );
  }
}
