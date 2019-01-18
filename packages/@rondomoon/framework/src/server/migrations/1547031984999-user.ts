import {MigrationInterface, QueryRunner} from "typeorm";

export class user1547031984999 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
    }

}
