import {MigrationInterface, QueryRunner} from "typeorm";

export class roleUnique1548412884820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`DROP INDEX "IDX_55a938fda82579fd3ec29b3c28"`);
        await queryRunner.query(`DROP INDEX "IDX_4a06baede7d9cf51aef879fb0e"`);
        await queryRunner.query(`DROP INDEX "IDX_e03827c061fbf85fd3aae454ae"`);
        await queryRunner.query(`DROP INDEX "IDX_fe13edd1431a248a0eeac11ae4"`);
        await queryRunner.query(`CREATE TABLE "temporary_spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "spam"`);
        await queryRunner.query(`DROP TABLE "spam"`);
        await queryRunner.query(`ALTER TABLE "temporary_spam" RENAME TO "spam"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`CREATE TABLE "temporary_role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_role"("id", "createDate", "updateDate", "name") SELECT "id", "createDate", "updateDate", "name" FROM "role"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`ALTER TABLE "temporary_role" RENAME TO "role"`);
        await queryRunner.query(`CREATE TABLE "temporary_role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, CONSTRAINT "UQ_d430b72bf1eaebce7f87068a431" UNIQUE ("name"))`);
        await queryRunner.query(`INSERT INTO "temporary_role"("id", "createDate", "updateDate", "name") SELECT "id", "createDate", "updateDate", "name" FROM "role"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`ALTER TABLE "temporary_role" RENAME TO "role"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_55a938fda82579fd3ec29b3c28" ON "team" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e03827c061fbf85fd3aae454ae" ON "site" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a06baede7d9cf51aef879fb0e" ON "site" ("teamId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe13edd1431a248a0eeac11ae4" ON "comment" ("storyId") `);
        await queryRunner.query(`CREATE TABLE "temporary_spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "spam_userid_commentid" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "spam"`);
        await queryRunner.query(`DROP TABLE "spam"`);
        await queryRunner.query(`ALTER TABLE "temporary_spam" RENAME TO "spam"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "vote_userid_commentid" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
        await queryRunner.query(`INSERT INTO "role"("id", "name") VALUES (1, 'ADMIN')`);
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
        await queryRunner.query(`DROP INDEX "IDX_4a06baede7d9cf51aef879fb0e"`);
        await queryRunner.query(`DROP INDEX "IDX_e03827c061fbf85fd3aae454ae"`);
        await queryRunner.query(`DROP INDEX "IDX_55a938fda82579fd3ec29b3c28"`);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`ALTER TABLE "role" RENAME TO "temporary_role"`);
        await queryRunner.query(`CREATE TABLE "role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "role"("id", "createDate", "updateDate", "name") SELECT "id", "createDate", "updateDate", "name" FROM "temporary_role"`);
        await queryRunner.query(`DROP TABLE "temporary_role"`);
        await queryRunner.query(`ALTER TABLE "role" RENAME TO "temporary_role"`);
        await queryRunner.query(`CREATE TABLE "role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "role"("id", "createDate", "updateDate", "name") SELECT "id", "createDate", "updateDate", "name" FROM "temporary_role"`);
        await queryRunner.query(`DROP TABLE "temporary_role"`);
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "UQ_5ef3b030c86a67d7c3cce97a978" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "spam" RENAME TO "temporary_spam"`);
        await queryRunner.query(`CREATE TABLE "spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "UQ_885dac94f112af83664ccd06dd9" UNIQUE ("userId", "commentId"), CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_spam"`);
        await queryRunner.query(`DROP TABLE "temporary_spam"`);
        await queryRunner.query(`CREATE INDEX "IDX_fe13edd1431a248a0eeac11ae4" ON "comment" ("storyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e03827c061fbf85fd3aae454ae" ON "site" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a06baede7d9cf51aef879fb0e" ON "site" ("teamId") `);
        await queryRunner.query(`CREATE INDEX "IDX_55a938fda82579fd3ec29b3c28" ON "team" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
    }

}
