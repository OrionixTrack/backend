import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastPositionToVehicle1764785548012
  implements MigrationInterface
{
  name = 'AddLastPositionToVehicle1764785548012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_latitude" numeric(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_longitude" numeric(10,7)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_speed" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_temperature" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_humidity" numeric(5,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" ADD "last_update_time" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vehicle" DROP COLUMN "last_update_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" DROP COLUMN "last_humidity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" DROP COLUMN "last_temperature"`,
    );
    await queryRunner.query(`ALTER TABLE "vehicle" DROP COLUMN "last_speed"`);
    await queryRunner.query(
      `ALTER TABLE "vehicle" DROP COLUMN "last_longitude"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vehicle" DROP COLUMN "last_latitude"`,
    );
  }
}
