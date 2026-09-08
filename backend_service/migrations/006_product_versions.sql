
/* =========================================================
   006_product_versions.sql
   Module: 04-product-file
   ========================================================= */

CREATE TABLE "ProductVersions" (
    "ProductVersionId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE CASCADE,

    "VersionNumber" VARCHAR(50) NOT NULL,

    "ReleaseNotes" TEXT,

    "IsCurrent" BOOLEAN NOT NULL
        DEFAULT FALSE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UQ_ProductVersions_Product_Version"
        UNIQUE ("ProductId", "VersionNumber"),

    CONSTRAINT "CK_ProductVersions_Version_NotBlank"
        CHECK (btrim("VersionNumber") <> '')
);

CREATE UNIQUE INDEX "UX_ProductVersions_Current"
ON "ProductVersions" ("ProductId")
WHERE "IsCurrent" = TRUE;

CREATE INDEX "IX_ProductVersions_ProductId"
ON "ProductVersions" ("ProductId");
