import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicTokenToTrackingChannel1763896970680
  implements MigrationInterface
{
  name = 'AddPublicTokenToTrackingChannel1763896970680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracking_channel"
          ADD "public_token" character varying(21)`,
    );
    await queryRunner.query(
      `UPDATE "tracking_channel"
       SET "public_token" = substr(md5(random()::text), 1, 21)
       WHERE "public_token" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracking_channel"
          ALTER COLUMN "public_token" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracking_channel"
          ADD CONSTRAINT "UQ_7a50b3e2fa33c77d3796b7365ee" UNIQUE ("public_token")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracking_channel"
          DROP CONSTRAINT "UQ_7a50b3e2fa33c77d3796b7365ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracking_channel"
          DROP COLUMN "public_token"`,
    );
  }
}
