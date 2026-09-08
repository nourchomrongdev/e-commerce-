
/* =========================================================
   014_moderation_dmca.sql
   Module: 07-review-moderation
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'moderation_status'
    ) THEN
        CREATE TYPE moderation_status AS ENUM (
            'pending',
            'under_review',
            'approved',
            'rejected',
            'resolved'
        );
    END IF;
END $$;


CREATE TABLE "ModerationCases" (
    "ModerationCaseId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT
        REFERENCES "Products"("ProductId")
        ON DELETE SET NULL,

    "ReviewId" BIGINT
        REFERENCES "Reviews"("ReviewId")
        ON DELETE SET NULL,

    "ReportedByUserId" INT
        REFERENCES "UserAccounts"("UserId")
        ON DELETE SET NULL,

    "AssignedToUserId" INT
        REFERENCES "UserAccounts"("UserId")
        ON DELETE SET NULL,

    "Reason" VARCHAR(255) NOT NULL,

    "Description" TEXT,

    "Status" moderation_status NOT NULL
        DEFAULT 'pending',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE "DMCAReports" (
    "DMCAReportId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT
        REFERENCES "Products"("ProductId")
        ON DELETE SET NULL,

    "ReporterName" VARCHAR(255) NOT NULL,

    "ReporterEmail" VARCHAR(255) NOT NULL,

    "ClaimDescription" TEXT NOT NULL,

    "EvidenceUrl" TEXT,

    "Status" moderation_status NOT NULL
        DEFAULT 'pending',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE "TakedownRequests" (
    "TakedownRequestId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "DMCAReportId" BIGINT
        REFERENCES "DMCAReports"("DMCAReportId")
        ON DELETE SET NULL,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE CASCADE,

    "Reason" TEXT NOT NULL,

    "Status" moderation_status NOT NULL
        DEFAULT 'pending',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "ResolvedAt" TIMESTAMPTZ
);


CREATE INDEX "IX_ModerationCases_ProductId"
ON "ModerationCases" ("ProductId");

CREATE INDEX "IX_ModerationCases_Status"
ON "ModerationCases" ("Status");

CREATE INDEX "IX_DMCAReports_ProductId"
ON "DMCAReports" ("ProductId");

CREATE INDEX "IX_DMCAReports_Status"
ON "DMCAReports" ("Status");

CREATE INDEX "IX_TakedownRequests_ProductId"
ON "TakedownRequests" ("ProductId");

CREATE TRIGGER "TR_ModerationCases_SetUpdatedAt"
BEFORE UPDATE ON "ModerationCases"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_DMCAReports_SetUpdatedAt"
BEFORE UPDATE ON "DMCAReports"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
