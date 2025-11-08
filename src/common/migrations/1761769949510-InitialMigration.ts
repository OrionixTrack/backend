import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1761769949510 implements MigrationInterface {
  name = 'InitialMigration1761769949510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "company_owner"
                             (
                                 "company_owner_id" SERIAL                 NOT NULL,
                                 "full_name"        character varying(255) NOT NULL,
                                 "email"            character varying(255) NOT NULL,
                                 "password"         character varying      NOT NULL,
                                 "company_id"       integer                NOT NULL,
                                 CONSTRAINT "UQ_2e71e930627351c26207d1a299d" UNIQUE ("email"),
                                 CONSTRAINT "REL_8a93df26fa2c8d4e2d58ce7255" UNIQUE ("company_id"),
                                 CONSTRAINT "PK_f0b19b694a5b529c46172a1707a" PRIMARY KEY ("company_owner_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "dispatcher"
                             (
                                 "dispatcher_id" SERIAL                 NOT NULL,
                                 "name"          character varying(255) NOT NULL,
                                 "surname"       character varying(255) NOT NULL,
                                 "email"         character varying(255) NOT NULL,
                                 "password"      character varying      NOT NULL,
                                 "register_date" TIMESTAMP              NOT NULL DEFAULT now(),
                                 "company_id"    integer                NOT NULL,
                                 CONSTRAINT "UQ_cc646f300114854891ae417c6e2" UNIQUE ("email"),
                                 CONSTRAINT "PK_cb8a51d9b8befb092acffe3a703" PRIMARY KEY ("dispatcher_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "tracking_channel"
                             (
                                 "tracking_channel_id" SERIAL                 NOT NULL,
                                 "name"                character varying(255) NOT NULL,
                                 "company_id"          integer                NOT NULL,
                                 "assigned_trip_id"    integer,
                                 CONSTRAINT "PK_75a82daccd046114b681e8f6b84" PRIMARY KEY ("tracking_channel_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "sensor_data"
                             (
                                 "sensor_data_id" SERIAL         NOT NULL,
                                 "datetime"       TIMESTAMP      NOT NULL,
                                 "speed"          numeric(5, 2),
                                 "latitude"       numeric(10, 7) NOT NULL,
                                 "longitude"      numeric(10, 7) NOT NULL,
                                 "temperature"    numeric(5, 2),
                                 "humidity"       numeric(5, 2),
                                 "trip_id"        integer        NOT NULL,
                                 CONSTRAINT "PK_bb59350ae5869410e30db103574" PRIMARY KEY ("sensor_data_id")
                             )`);
    await queryRunner.query(
      `CREATE TYPE "public"."trip_status_enum" AS ENUM('planned', 'in_progress', 'completed', 'cancelled')`,
    );
    await queryRunner.query(`CREATE TABLE "trip"
                             (
                                 "trip_id"                  SERIAL                      NOT NULL,
                                 "company_id"               integer                     NOT NULL,
                                 "assigned_driver_id"       integer,
                                 "created_by_dispatcher_id" integer                     NOT NULL,
                                 "vehicle_id"               integer,
                                 "name"                     character varying(255)      NOT NULL,
                                 "description"              text,
                                 "status"                   "public"."trip_status_enum" NOT NULL DEFAULT 'planned',
                                 "planned_start_datetime"   TIMESTAMP,
                                 "actual_start_datetime"    TIMESTAMP,
                                 "end_datetime"             TIMESTAMP,
                                 "contact_info"             character varying(255),
                                 "start_address"            text,
                                 "start_latitude"           numeric(10, 7),
                                 "start_longitude"          numeric(10, 7),
                                 "finish_address"           text                        NOT NULL,
                                 "finish_latitude"          numeric(10, 7)              NOT NULL,
                                 "finish_longitude"         numeric(10, 7)              NOT NULL,
                                 CONSTRAINT "PK_b8e163f56d1c292115e2fe9aa18" PRIMARY KEY ("trip_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "driver"
                             (
                                 "driver_id"     SERIAL                 NOT NULL,
                                 "name"          character varying(255) NOT NULL,
                                 "surname"       character varying(255) NOT NULL,
                                 "email"         character varying(255) NOT NULL,
                                 "password"      character varying      NOT NULL,
                                 "register_date" TIMESTAMP              NOT NULL DEFAULT now(),
                                 "company_id"    integer                NOT NULL,
                                 CONSTRAINT "UQ_bb2050b01c92e5eb0ecee4c77fb" UNIQUE ("email"),
                                 CONSTRAINT "PK_f27607c5716c6afcef0eb6aa1b0" PRIMARY KEY ("driver_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "tracker"
                             (
                                 "tracker_id"          SERIAL                 NOT NULL,
                                 "name"                character varying(255) NOT NULL,
                                 "device_secret_token" character varying      NOT NULL,
                                 "vehicle_id"          integer,
                                 "company_id"          integer                NOT NULL,
                                 CONSTRAINT "UQ_d6e45de722685616d4985af11f9" UNIQUE ("device_secret_token"),
                                 CONSTRAINT "REL_47fdd0bafbd79601eaf5a09968" UNIQUE ("vehicle_id"),
                                 CONSTRAINT "PK_ad6ce40f0b5659939e41db49006" PRIMARY KEY ("tracker_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "company"
                             (
                                 "company_id" SERIAL                 NOT NULL,
                                 "name"       character varying(255) NOT NULL,
                                 CONSTRAINT "PK_b7f9888ba8bd654c4860ddfcb3a" PRIMARY KEY ("company_id")
                             )`);
    await queryRunner.query(`CREATE TABLE "vehicle"
                             (
                                 "vehicle_id"      SERIAL                 NOT NULL,
                                 "name"            character varying(255) NOT NULL,
                                 "license_plate"   character varying(50)  NOT NULL,
                                 "is_active"       boolean                NOT NULL DEFAULT true,
                                 "brand"           character varying(100),
                                 "model"           character varying(100),
                                 "production_year" integer,
                                 "capacity"        numeric(10, 2),
                                 "company_id"      integer,
                                 CONSTRAINT "UQ_08f5ab49f428e2090a434623a86" UNIQUE ("license_plate"),
                                 CONSTRAINT "PK_8b107f0822abfa70997e54a0a61" PRIMARY KEY ("vehicle_id")
                             )`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        ADD CONSTRAINT "FK_8a93df26fa2c8d4e2d58ce72550" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "dispatcher"
        ADD CONSTRAINT "FK_482f9ebfdc953e43e67df62a142" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "tracking_channel"
        ADD CONSTRAINT "FK_825e22bf42686e885c30107190d" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "tracking_channel"
        ADD CONSTRAINT "FK_fe49e2ba1fee53d616d24d082e3" FOREIGN KEY ("assigned_trip_id") REFERENCES "trip" ("trip_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "sensor_data"
        ADD CONSTRAINT "FK_4335823d79df1e04693e998e0c0" FOREIGN KEY ("trip_id") REFERENCES "trip" ("trip_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "trip"
        ADD CONSTRAINT "FK_7757f194c03da784a65ec4b46f1" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "trip"
        ADD CONSTRAINT "FK_169f443339cf2525f8a6b274951" FOREIGN KEY ("assigned_driver_id") REFERENCES "driver" ("driver_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "trip"
        ADD CONSTRAINT "FK_26f458b778236431c6f1bec6217" FOREIGN KEY ("created_by_dispatcher_id") REFERENCES "dispatcher" ("dispatcher_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "trip"
        ADD CONSTRAINT "FK_5ff7a6fd578b866764c36cad06b" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle" ("vehicle_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "driver"
        ADD CONSTRAINT "FK_3b13e71bc6059b75ec5801f863d" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "tracker"
        ADD CONSTRAINT "FK_47fdd0bafbd79601eaf5a099689" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle" ("vehicle_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "tracker"
        ADD CONSTRAINT "FK_21ad1cd746285cbef0325a9b535" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "vehicle"
        ADD CONSTRAINT "FK_925a975409d7466b8919ca9b9ed" FOREIGN KEY ("company_id") REFERENCES "company" ("company_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vehicle"
        DROP CONSTRAINT "FK_925a975409d7466b8919ca9b9ed"`);
    await queryRunner.query(`ALTER TABLE "tracker"
        DROP CONSTRAINT "FK_21ad1cd746285cbef0325a9b535"`);
    await queryRunner.query(`ALTER TABLE "tracker"
        DROP CONSTRAINT "FK_47fdd0bafbd79601eaf5a099689"`);
    await queryRunner.query(`ALTER TABLE "driver"
        DROP CONSTRAINT "FK_3b13e71bc6059b75ec5801f863d"`);
    await queryRunner.query(`ALTER TABLE "trip"
        DROP CONSTRAINT "FK_5ff7a6fd578b866764c36cad06b"`);
    await queryRunner.query(`ALTER TABLE "trip"
        DROP CONSTRAINT "FK_26f458b778236431c6f1bec6217"`);
    await queryRunner.query(`ALTER TABLE "trip"
        DROP CONSTRAINT "FK_169f443339cf2525f8a6b274951"`);
    await queryRunner.query(`ALTER TABLE "trip"
        DROP CONSTRAINT "FK_7757f194c03da784a65ec4b46f1"`);
    await queryRunner.query(`ALTER TABLE "sensor_data"
        DROP CONSTRAINT "FK_4335823d79df1e04693e998e0c0"`);
    await queryRunner.query(`ALTER TABLE "tracking_channel"
        DROP CONSTRAINT "FK_fe49e2ba1fee53d616d24d082e3"`);
    await queryRunner.query(`ALTER TABLE "tracking_channel"
        DROP CONSTRAINT "FK_825e22bf42686e885c30107190d"`);
    await queryRunner.query(`ALTER TABLE "dispatcher"
        DROP CONSTRAINT "FK_482f9ebfdc953e43e67df62a142"`);
    await queryRunner.query(`ALTER TABLE "company_owner"
        DROP CONSTRAINT "FK_8a93df26fa2c8d4e2d58ce72550"`);
    await queryRunner.query(`DROP TABLE "vehicle"`);
    await queryRunner.query(`DROP TABLE "company"`);
    await queryRunner.query(`DROP TABLE "tracker"`);
    await queryRunner.query(`DROP TABLE "driver"`);
    await queryRunner.query(`DROP TABLE "trip"`);
    await queryRunner.query(`DROP TYPE "public"."trip_status_enum"`);
    await queryRunner.query(`DROP TABLE "sensor_data"`);
    await queryRunner.query(`DROP TABLE "tracking_channel"`);
    await queryRunner.query(`DROP TABLE "dispatcher"`);
    await queryRunner.query(`DROP TABLE "company_owner"`);
  }
}
