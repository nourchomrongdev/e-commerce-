
/* =========================================================
   004_categories_products.sql
   Module: 04-product-file
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'product_status'
    ) THEN
        CREATE TYPE product_status AS ENUM (
            'draft',
            'pending',
            'published',
            'rejected',
            'suspended',
            'archived'
        );
    END IF;
END $$;


CREATE TABLE "Categories" (
    "CategoryId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "ParentCategoryId" INT
        REFERENCES "Categories"("CategoryId")
        ON DELETE SET NULL,

    "CategoryName" VARCHAR(150) NOT NULL,

    "Slug" VARCHAR(150) NOT NULL UNIQUE,

    "Description" TEXT,

    "IconUrl" TEXT,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Categories_Name_NotBlank"
        CHECK (btrim("CategoryName") <> ''),

    CONSTRAINT "CK_Categories_Slug_NotBlank"
        CHECK (btrim("Slug") <> '')
);


CREATE TABLE "Products" (
    "ProductId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "StorefrontId" INT NOT NULL
        REFERENCES "Storefronts"("StorefrontId")
        ON DELETE RESTRICT,

    "CategoryId" INT NOT NULL
        REFERENCES "Categories"("CategoryId")
        ON DELETE RESTRICT,

    "ProductName" VARCHAR(255) NOT NULL,

    "Slug" VARCHAR(255) NOT NULL UNIQUE,

    "Description" TEXT,

    "ProductType" VARCHAR(50) NOT NULL,

    "Price" NUMERIC(12,2) NOT NULL
        DEFAULT 0,

    "Currency" CHAR(3) NOT NULL
        DEFAULT 'USD',

    "Status" product_status NOT NULL
        DEFAULT 'draft',

    "ThumbnailUrl" TEXT,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Products_Name_NotBlank"
        CHECK (btrim("ProductName") <> ''),

    CONSTRAINT "CK_Products_Slug_NotBlank"
        CHECK (btrim("Slug") <> ''),

    CONSTRAINT "CK_Products_Price_NonNegative"
        CHECK ("Price" >= 0)
);


CREATE INDEX "IX_Categories_ParentCategoryId"
ON "Categories" ("ParentCategoryId");

CREATE INDEX "IX_Categories_IsActive"
ON "Categories" ("IsActive");

CREATE INDEX "IX_Products_StorefrontId"
ON "Products" ("StorefrontId");

CREATE INDEX "IX_Products_CategoryId"
ON "Products" ("CategoryId");

CREATE INDEX "IX_Products_Status"
ON "Products" ("Status");

CREATE INDEX "IX_Products_CreatedAt"
ON "Products" ("CreatedAt");


CREATE TRIGGER "TR_Categories_SetUpdatedAt"
BEFORE UPDATE ON "Categories"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_Products_SetUpdatedAt"
BEFORE UPDATE ON "Products"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
