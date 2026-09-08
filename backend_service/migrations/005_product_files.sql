
/* =========================================================
   005_product_files.sql
   Module: 04-product-file
   ========================================================= */

CREATE TABLE "ProductFiles" (
    "ProductFileId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE CASCADE,

    "FileName" VARCHAR(255) NOT NULL,

    "StorageKey" TEXT NOT NULL,

    "FileUrl" TEXT,

    "FileSize" BIGINT NOT NULL,

    "MimeType" VARCHAR(150),

    "Checksum" VARCHAR(255),

    "IsProtected" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_ProductFiles_FileName_NotBlank"
        CHECK (btrim("FileName") <> ''),

    CONSTRAINT "CK_ProductFiles_StorageKey_NotBlank"
        CHECK (btrim("StorageKey") <> ''),

    CONSTRAINT "CK_ProductFiles_FileSize_NonNegative"
        CHECK ("FileSize" >= 0)
);

CREATE INDEX "IX_ProductFiles_ProductId"
ON "ProductFiles" ("ProductId");

CREATE INDEX "IX_ProductFiles_IsActive"
ON "ProductFiles" ("IsActive");

CREATE INDEX "IX_ProductFiles_Checksum"
ON "ProductFiles" ("Checksum");
