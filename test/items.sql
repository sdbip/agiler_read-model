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

INSERT INTO "public"."items" ("id", "type", "progress", "title", "parent_id", "assignee") VALUES
('epic', 'Epic', 'notStarted', 'Epic Feature', NULL, NULL),
('mmf', 'Feature', 'notStarted', 'MMF', 'epic', NULL),
('story', 'Story', 'notStarted', 'Parent Story', NULL, NULL),
('subtask', 'Task', 'notStarted', 'Task', 'story', NULL);
