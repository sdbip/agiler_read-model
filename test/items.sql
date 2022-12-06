DROP TABLE IF EXISTS "public"."items";
CREATE TABLE "public"."items" (
    "id" text NOT NULL,
    "type" text NOT NULL,
    "progress" text NOT NULL,
    "title" text NOT NULL,
    "parent_id" text,
    "assignee" text,
    PRIMARY KEY ("id")
);
