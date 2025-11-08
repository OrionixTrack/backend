import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLanguage1762105141196 implements MigrationInterface {
  name = 'AddUserLanguage1762105141196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."company_owner_language_enum" AS ENUM('en', 'uk')`,
    );
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD "language" "public"."company_owner_language_enum" NOT NULL DEFAULT 'en'`);
    await queryRunner.query(
      `CREATE TYPE "public"."dispatcher_language_enum" AS ENUM('en', 'uk')`,
    );
    await queryRunner.query(`ALTER TABLE "dispatcher"
        ADD "language" "public"."dispatcher_language_enum" NOT NULL DEFAULT 'en'`);
    await queryRunner.query(
      `CREATE TYPE "public"."driver_language_enum" AS ENUM('en', 'uk')`,
    );
    await queryRunner.query(`ALTER TABLE "driver"
        ADD "language" "public"."driver_language_enum" NOT NULL DEFAULT 'en'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "driver"
        DROP COLUMN "language"`);
    await queryRunner.query(`DROP TYPE "public"."driver_language_enum"`);
    await queryRunner.query(`ALTER TABLE "dispatcher"
        DROP COLUMN "language"`);
    await queryRunner.query(`DROP TYPE "public"."dispatcher_language_enum"`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP COLUMN "language"`);
    await queryRunner.query(`DROP TYPE "public"."company_owner_language_enum"`);
  }
}
