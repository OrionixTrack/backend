import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBearingFields1764787757462 implements MigrationInterface {
  name = 'AddBearingFields1764787757462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sensor_data" ADD "bearing" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_bearing" numeric(5,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicle" DROP COLUMN "last_bearing"`);
    await queryRunner.query(`ALTER TABLE "sensor_data" DROP COLUMN "bearing"`);
  }
}
