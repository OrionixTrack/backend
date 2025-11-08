import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetToken1762607095389 implements MigrationInterface {
  name = 'PasswordResetToken1762607095389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "password_reset_token" ("token_id" SERIAL NOT NULL, "token" character varying NOT NULL, "driver_id" integer, "dispatcher_id" integer, "company_owner_id" integer, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6c50e3a3bee2912c1153c63aa64" UNIQUE ("token"), CONSTRAINT "PK_6109f796bd74174c94dec7f0e4c" PRIMARY KEY ("token_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_65c5f9828e9356d6f35460e3218" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_58ef091af2636842cdc501e9761" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("dispatcher_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" ADD CONSTRAINT "FK_77c1d29ba99bc22868ff11db856" FOREIGN KEY ("company_owner_id") REFERENCES "company_owner"("company_owner_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_77c1d29ba99bc22868ff11db856"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_58ef091af2636842cdc501e9761"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_reset_token" DROP CONSTRAINT "FK_65c5f9828e9356d6f35460e3218"`,
    );
    await queryRunner.query(`DROP TABLE "password_reset_token"`);
  }
}
