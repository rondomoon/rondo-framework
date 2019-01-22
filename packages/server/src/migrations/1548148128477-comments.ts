import {MigrationInterface, QueryRunner} from "typeorm";

export class comments1548148128477 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`CREATE TABLE "story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer)`);
        await queryRunner.query(`CREATE TABLE "role" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "user_team" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "teamId" integer NOT NULL, "roleId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "team" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "site" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "domain" varchar NOT NULL, "userId" integer NOT NULL, "teamId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "message" text NOT NULL, "storyId" integer NOT NULL, "userId" integer NOT NULL, "parentId" integer NOT NULL, "spams" integer NOT NULL, "votes" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "temporary_user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "user_email"`);
        await queryRunner.query(`DROP TABLE "user_email"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_email" RENAME TO "user_email"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60), "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "password") SELECT "id", "password" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
        await queryRunner.query(`CREATE TABLE "temporary_story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer, CONSTRAINT "FK_d2e9a15dc1deb586d4223281341" FOREIGN KEY ("siteId") REFERENCES "site" ("id"), CONSTRAINT "FK_7bbd497b737c1bc248205d3c976" FOREIGN KEY ("commentsId") REFERENCES "comment" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "story"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`ALTER TABLE "temporary_story" RENAME TO "story"`);
        await queryRunner.query(`CREATE TABLE "temporary_user_team" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "teamId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "FK_32ecd75ddc134fd687792507e90" FOREIGN KEY ("userId") REFERENCES "user" ("id"), CONSTRAINT "FK_e50bd38e4f1ba4fa1f3c6a356bc" FOREIGN KEY ("teamId") REFERENCES "team" ("id"), CONSTRAINT "FK_63521ce23498339097b5471bd39" FOREIGN KEY ("roleId") REFERENCES "role" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_user_team"("id", "createDate", "updateDate", "userId", "teamId", "roleId") SELECT "id", "createDate", "updateDate", "userId", "teamId", "roleId" FROM "user_team"`);
        await queryRunner.query(`DROP TABLE "user_team"`);
        await queryRunner.query(`ALTER TABLE "temporary_user_team" RENAME TO "user_team"`);
        await queryRunner.query(`CREATE TABLE "temporary_site" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "domain" varchar NOT NULL, "userId" integer NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "FK_e03827c061fbf85fd3aae454aec" FOREIGN KEY ("userId") REFERENCES "user" ("id"), CONSTRAINT "FK_4a06baede7d9cf51aef879fb0e4" FOREIGN KEY ("teamId") REFERENCES "team" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_site"("id", "createDate", "updateDate", "name", "domain", "userId", "teamId") SELECT "id", "createDate", "updateDate", "name", "domain", "userId", "teamId" FROM "site"`);
        await queryRunner.query(`DROP TABLE "site"`);
        await queryRunner.query(`ALTER TABLE "temporary_site" RENAME TO "site"`);
        await queryRunner.query(`CREATE TABLE "temporary_comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "message" text NOT NULL, "storyId" integer NOT NULL, "userId" integer NOT NULL, "parentId" integer NOT NULL, "spams" integer NOT NULL, "votes" integer NOT NULL, CONSTRAINT "FK_fe13edd1431a248a0eeac11ae43" FOREIGN KEY ("storyId") REFERENCES "story" ("id"), CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_comment"("id", "createDate", "updateDate", "message", "storyId", "userId", "parentId", "spams", "votes") SELECT "id", "createDate", "updateDate", "message", "storyId", "userId", "parentId", "spams", "votes" FROM "comment"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`ALTER TABLE "temporary_comment" RENAME TO "comment"`);
        await queryRunner.query(`CREATE TABLE "temporary_spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_ec8bc4fa789466cf62f5949f5cc" FOREIGN KEY ("userId") REFERENCES "user" ("id"), CONSTRAINT "FK_1bf468db8f4d18b424bb3eafae5" FOREIGN KEY ("commentId") REFERENCES "comment" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "spam"`);
        await queryRunner.query(`DROP TABLE "spam"`);
        await queryRunner.query(`ALTER TABLE "temporary_spam" RENAME TO "spam"`);
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL, CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user" ("id"), CONSTRAINT "FK_ad37adcff60fdb9670a97868ab1" FOREIGN KEY ("commentId") REFERENCES "comment" ("id"))`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "vote"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
        await queryRunner.query(`ALTER TABLE "spam" RENAME TO "temporary_spam"`);
        await queryRunner.query(`CREATE TABLE "spam" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "commentId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "spam"("id", "createDate", "updateDate", "userId", "commentId") SELECT "id", "createDate", "updateDate", "userId", "commentId" FROM "temporary_spam"`);
        await queryRunner.query(`DROP TABLE "temporary_spam"`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME TO "temporary_comment"`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "message" text NOT NULL, "storyId" integer NOT NULL, "userId" integer NOT NULL, "parentId" integer NOT NULL, "spams" integer NOT NULL, "votes" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "comment"("id", "createDate", "updateDate", "message", "storyId", "userId", "parentId", "spams", "votes") SELECT "id", "createDate", "updateDate", "message", "storyId", "userId", "parentId", "spams", "votes" FROM "temporary_comment"`);
        await queryRunner.query(`DROP TABLE "temporary_comment"`);
        await queryRunner.query(`ALTER TABLE "site" RENAME TO "temporary_site"`);
        await queryRunner.query(`CREATE TABLE "site" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "name" varchar NOT NULL, "domain" varchar NOT NULL, "userId" integer NOT NULL, "teamId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "site"("id", "createDate", "updateDate", "name", "domain", "userId", "teamId") SELECT "id", "createDate", "updateDate", "name", "domain", "userId", "teamId" FROM "temporary_site"`);
        await queryRunner.query(`DROP TABLE "temporary_site"`);
        await queryRunner.query(`ALTER TABLE "user_team" RENAME TO "temporary_user_team"`);
        await queryRunner.query(`CREATE TABLE "user_team" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "teamId" integer NOT NULL, "roleId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "user_team"("id", "createDate", "updateDate", "userId", "teamId", "roleId") SELECT "id", "createDate", "updateDate", "userId", "teamId", "roleId" FROM "temporary_user_team"`);
        await queryRunner.query(`DROP TABLE "temporary_user_team"`);
        await queryRunner.query(`ALTER TABLE "story" RENAME TO "temporary_story"`);
        await queryRunner.query(`CREATE TABLE "story" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createDate" datetime NOT NULL DEFAULT (datetime('now')), "updateDate" datetime NOT NULL DEFAULT (datetime('now')), "url" varchar NOT NULL, "siteId" integer NOT NULL, "commentsId" integer)`);
        await queryRunner.query(`INSERT INTO "story"("id", "createDate", "updateDate", "url", "siteId", "commentsId") SELECT "id", "createDate", "updateDate", "url", "siteId", "commentsId" FROM "temporary_story"`);
        await queryRunner.query(`DROP TABLE "temporary_story"`);
        await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "password" varchar(60))`);
        await queryRunner.query(`INSERT INTO "user"("id", "password") SELECT "id", "password" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "user_email" RENAME TO "temporary_user_email"`);
        await queryRunner.query(`CREATE TABLE "user_email" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "email" varchar NOT NULL, "userId" integer NOT NULL, CONSTRAINT "UQ_f2bff75d7c18f08db06f81934b6" UNIQUE ("email"), CONSTRAINT "FK_9ada349d19d368d20fbf613eef9" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "user_email"("id", "email", "userId") SELECT "id", "email", "userId" FROM "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "temporary_user_email"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP TABLE "spam"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "site"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "user_team"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "story"`);
        await queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
    }

}
