
/* =========================================================
   002_activity_logs.sql
   Module: 02-activity-log
   ========================================================= */

CREATE TABLE "ActivityLogs" (
    "ActivityLogId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "UserId" INT
        REFERENCES "UserAccounts"("UserId")
        ON DELETE SET NULL,

    "Action" VARCHAR(100) NOT NULL,

    "EntityType" VARCHAR(100),

    "EntityId" BIGINT,

    "Description" TEXT,

    "IPAddress" INET,

    "UserAgent" TEXT,

    "Metadata" JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_ActivityLogs_Action_NotBlank"
        CHECK (btrim("Action") <> '')
);

CREATE INDEX "IX_ActivityLogs_UserId"
ON "ActivityLogs" ("UserId");

CREATE INDEX "IX_ActivityLogs_Action"
ON "ActivityLogs" ("Action");

CREATE INDEX "IX_ActivityLogs_Entity"
ON "ActivityLogs" ("EntityType", "EntityId");

CREATE INDEX "IX_ActivityLogs_CreatedAt"
ON "ActivityLogs" ("CreatedAt");

CREATE INDEX "IX_ActivityLogs_Metadata"
ON "ActivityLogs"
USING GIN ("Metadata");
