import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyOwnerEmailVerification1762090967643
  implements MigrationInterface
{
  name = 'AddCompanyOwnerEmailVerification1762090967643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD "is_email_verified" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD "email_verification_token" character varying`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD "email_verification_token_expires" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP COLUMN "email_verification_token_expires"`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP COLUMN "email_verification_token"`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP COLUMN "is_email_verified"`);
  }
}
