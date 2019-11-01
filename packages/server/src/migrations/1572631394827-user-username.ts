import {MigrationInterface, QueryRunner} from "typeorm";

export class userUsername1572631394827 implements MigrationInterface {
    name = 'userUsername1572631394827'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60), "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "username" varchar NOT NULL, CONSTRAINT "UQ_3021ae0235cf9c4a6d59663f859" UNIQUE ("username"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "password", "createDate", "updateDate", "firstName", "lastName") SELECT "id", "password", "createDate", "updateDate", "firstName", "lastName" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60), "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "firstName" varchar, "lastName" varchar, "username" varchar NOT NULL, CONSTRAINT "UQ_3021ae0235cf9c4a6d59663f859" UNIQUE ("username"))`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "password", "createDate", "updateDate", "firstName", "lastName", "username") SELECT "id", "password", "createDate", "updateDate", "firstName", "lastName", "username" FROM "user"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60), "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "username" varchar NOT NULL, CONSTRAINT "UQ_3021ae0235cf9c4a6d59663f859" UNIQUE ("username"))`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "password", "createDate", "updateDate", "firstName", "lastName", "username") SELECT "id", "password", "createDate", "updateDate", "firstName", "lastName", "username" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`, undefined);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60), "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "firstName" varchar NOT NULL, "lastName" varchar NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "user"("id", "password", "createDate", "updateDate", "firstName", "lastName") SELECT "id", "password", "createDate", "updateDate", "firstName", "lastName" FROM "temporary_user"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_user"`, undefined);
    }

}
