import {MigrationInterface, QueryRunner} from "typeorm";

export class session1547474320589 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
        await queryRunner.query(`CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer NOT NULL, "json" text NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id") SELECT "id" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`CREATE TABLE "temporary_session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer NOT NULL, "json" text NOT NULL, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "session"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`ALTER TABLE "temporary_session" RENAME TO "session"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`ALTER TABLE "session" RENAME TO "temporary_session"`);
        await queryRunner.query(`CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer NOT NULL, "json" text NOT NULL)`);
        await queryRunner.query(`INSERT INTO "session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "temporary_session"`);
        await queryRunner.query(`DROP TABLE "temporary_session"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user"("id") SELECT "id" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
    }

}
