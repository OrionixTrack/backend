import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTrackerTokenToHash1764000000000
  implements MigrationInterface
{
  name = 'RenameTrackerTokenToHash1764000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracker" DROP CONSTRAINT IF EXISTS "UQ_tracker_device_secret_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracker" DROP CONSTRAINT IF EXISTS "tracker_device_secret_token_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracker" RENAME COLUMN "device_secret_token" TO "device_secret_token_hash"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracker" RENAME COLUMN "device_secret_token_hash" TO "device_secret_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracker" ADD CONSTRAINT "tracker_device_secret_token_key" UNIQUE ("device_secret_token")`,
    );
  }
}
