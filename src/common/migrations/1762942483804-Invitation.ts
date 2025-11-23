import { MigrationInterface, QueryRunner } from 'typeorm';

export class Invitation1762942483804 implements MigrationInterface {
  name = 'Invitation1762942483804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invitation_role_enum" AS ENUM('driver', 'dispatcher')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invitation_status_enum" AS ENUM('pending', 'accepted', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitation" ("invitation_id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "role" "public"."invitation_role_enum" NOT NULL, "token" character varying NOT NULL, "status" "public"."invitation_status_enum" NOT NULL DEFAULT 'pending', "expires_at" TIMESTAMP NOT NULL, "company_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "accepted_at" TIMESTAMP, CONSTRAINT "UQ_e061236e6abd8503aa3890af94c" UNIQUE ("token"), CONSTRAINT "PK_693b75c7dec5bc338a8927a8f72" PRIMARY KEY ("invitation_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_088c9b15c9465faaa40472b71cf" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_088c9b15c9465faaa40472b71cf"`,
    );
    await queryRunner.query(`DROP TABLE "invitation"`);
    await queryRunner.query(`DROP TYPE "public"."invitation_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invitation_role_enum"`);
  }
}
