import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastEmailVerificationSent1762092912378
  implements MigrationInterface
{
  name = 'AddLastEmailVerificationSent1762092912378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD "last_verification_email_sent" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP COLUMN "last_verification_email_sent"`);
  }
}
