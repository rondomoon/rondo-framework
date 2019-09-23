import {MigrationInterface, QueryRunner} from "typeorm";

export class sessionExpiredAtBigint1569211662484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer, "json" text NOT NULL, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "session"`, undefined);
        await queryRunner.query(`DROP TABLE "session"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_session" RENAME TO "session"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `, undefined);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" bigint NOT NULL, "userId" integer, "json" text NOT NULL, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "session"`, undefined);
        await queryRunner.query(`DROP TABLE "session"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_session" RENAME TO "session"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`, undefined);
        await queryRunner.query(`ALTER TABLE "session" RENAME TO "temporary_session"`, undefined);
        await queryRunner.query(`CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer, "json" text NOT NULL, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "temporary_session"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_session"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `, undefined);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`, undefined);
        await queryRunner.query(`ALTER TABLE "session" RENAME TO "temporary_session"`, undefined);
        await queryRunner.query(`CREATE TABLE "session" ("id" varchar PRIMARY KEY NOT NULL, "expiredAt" integer NOT NULL, "userId" integer, "json" text NOT NULL, CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "session"("id", "expiredAt", "userId", "json") SELECT "id", "expiredAt", "userId", "json" FROM "temporary_session"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_session"`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `, undefined);
    }

}
