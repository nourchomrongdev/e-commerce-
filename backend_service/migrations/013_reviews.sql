
/* =========================================================
   013_reviews.sql
   Module: 07-review-moderation
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'review_status'
    ) THEN
        CREATE TYPE review_status AS ENUM (
            'pending',
            'approved',
            'rejected',
            'hidden'
        );
    END IF;
END $$;


CREATE TABLE "Reviews" (
    "ReviewId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE CASCADE,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "OrderItemId" BIGINT
        REFERENCES "OrderItems"("OrderItemId")
        ON DELETE SET NULL,

    "Rating" SMALLINT NOT NULL,

    "Title" VARCHAR(255),

    "Comment" TEXT,

    "Status" review_status NOT NULL
        DEFAULT 'pending',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Reviews_Rating"
        CHECK ("Rating" BETWEEN 1 AND 5),

    CONSTRAINT "UQ_Reviews_User_Product"
        UNIQUE ("UserId", "ProductId")
);

CREATE INDEX "IX_Reviews_ProductId"
ON "Reviews" ("ProductId");

CREATE INDEX "IX_Reviews_UserId"
ON "Reviews" ("UserId");

CREATE INDEX "IX_Reviews_Status"
ON "Reviews" ("Status");

CREATE INDEX "IX_Reviews_Rating"
ON "Reviews" ("Rating");

CREATE TRIGGER "TR_Reviews_SetUpdatedAt"
BEFORE UPDATE ON "Reviews"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
