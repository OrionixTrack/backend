import { MigrationInterface, QueryRunner } from 'typeorm';

export class SensorDataIndex1763930228732 implements MigrationInterface {
  name = 'SensorDataIndex1763930228732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracker" DROP CONSTRAINT "UQ_d6e45de722685616d4985af11f9"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sensor_data_trip_time" ON "sensor_data" ("trip_id", "datetime") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_sensor_data_trip_time"`);
    await queryRunner.query(
      `ALTER TABLE "tracker" ADD CONSTRAINT "UQ_d6e45de722685616d4985af11f9" UNIQUE ("device_secret_token_hash")`,
    );
  }
}
