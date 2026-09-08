
/* =========================================================
   007_product_previews.sql
   Module: 04-product-file
   ========================================================= */

CREATE TABLE "ProductPreviews" (
    "ProductPreviewId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE CASCADE,

    "PreviewType" VARCHAR(50) NOT NULL,

    "Title" VARCHAR(255),

    "PreviewUrl" TEXT NOT NULL,

    "SortOrder" INT NOT NULL
        DEFAULT 0,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_ProductPreviews_SortOrder_NonNegative"
        CHECK ("SortOrder" >= 0)
);

CREATE INDEX "IX_ProductPreviews_ProductId"
ON "ProductPreviews" ("ProductId");

CREATE INDEX "IX_ProductPreviews_SortOrder"
ON "ProductPreviews" ("ProductId", "SortOrder");
