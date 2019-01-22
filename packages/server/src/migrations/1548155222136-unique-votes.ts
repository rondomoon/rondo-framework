import {MigrationInterface, QueryRunner} from "typeorm";

export class uniqueVotes1548155222136 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`CREATE TABLE "temporary_story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer, CONSTRAINT "FK_7bbd497b737c1bc248205d3c976" FOREIGN KEY ("commentsId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d2e9a15dc1deb586d4223281341" FOREIGN KEY ("siteId") REFERENCES "site" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "story"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`ALTER TABLE "temporary_story" RENAME TO "story"`);
        await queryRunner.query(`CREATE TABLE "temporary_story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer, CONSTRAINT "UQ_baf24df1c33ae06d6eab18bda3b" UNIQUE ("url"), CONSTRAINT "FK_7bbd497b737c1bc248205d3c976" FOREIGN KEY ("commentsId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d2e9a15dc1deb586d4223281341" FOREIGN KEY ("siteId") REFERENCES "site" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "story"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`ALTER TABLE "temporary_story" RENAME TO "story"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe13edd1431a248a0eeac11ae4" ON "comment" ("storyId") `);
        await queryRunner.query(`CREATE TABLE "temporary_spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "spam_userid_commentid" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "spam"`);
        await queryRunner.query(`DROP TABLE "spam"`);
        await queryRunner.query(`ALTER TABLE "temporary_spam" RENAME TO "spam"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "vote_userid_commentid" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "spam" RENAME TO "temporary_spam"`);
        await queryRunner.query(`CREATE TABLE "spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_spam"`);
        await queryRunner.query(`DROP TABLE "temporary_spam"`);
        await queryRunner.query(`DROP INDEX "IDX_fe13edd1431a248a0eeac11ae4"`);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`ALTER TABLE "story" RENAME TO "temporary_story"`);
        await queryRunner.query(`CREATE TABLE "story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer, CONSTRAINT "FK_7bbd497b737c1bc248205d3c976" FOREIGN KEY ("commentsId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d2e9a15dc1deb586d4223281341" FOREIGN KEY ("siteId") REFERENCES "site" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "temporary_story"`);
        await queryRunner.query(`DROP TABLE "temporary_story"`);
        await queryRunner.query(`ALTER TABLE "story" RENAME TO "temporary_story"`);
        await queryRunner.query(`CREATE TABLE "story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer, CONSTRAINT "FK_7bbd497b737c1bc248205d3c976" FOREIGN KEY ("commentsId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d2e9a15dc1deb586d4223281341" FOREIGN KEY ("siteId") REFERENCES "site" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "temporary_story"`);
        await queryRunner.query(`DROP TABLE "temporary_story"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
    }

}
