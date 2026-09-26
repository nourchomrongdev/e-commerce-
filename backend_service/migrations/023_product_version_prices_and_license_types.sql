ALTER TABLE "ProductVersions"
ADD COLUMN IF NOT EXISTS "Price" NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE "ProductVersions" versions
SET "Price" = products."Price"
FROM "Products" products
WHERE versions."ProductId" = products."ProductId"
  AND versions."Price" = 0;

ALTER TABLE "ProductVersions"
ADD CONSTRAINT "CK_ProductVersions_Price_NonNegative"
CHECK ("Price" >= 0);

ALTER TABLE "ProductVersions"
ADD COLUMN IF NOT EXISTS "LicenseTypeId" INT
REFERENCES "LicenseTypes"("LicenseTypeId")
ON DELETE SET NULL;

ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS "DiscountType" VARCHAR(20) NOT NULL DEFAULT 'none';

ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS "DiscountAmount" NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "Products"
ADD CONSTRAINT "CK_Products_DiscountAmount_NonNegative"
CHECK ("DiscountAmount" >= 0);

UPDATE "LicenseTypes"
SET "LicenseName" = 'All',
    "Description" = 'All license for personal, non-commercial use.'
WHERE "LicenseName" = 'All'
  AND NOT EXISTS (
    SELECT 1 FROM "LicenseTypes" WHERE "LicenseName" = 'ALL'
  );

INSERT INTO "LicenseTypes" ("LicenseName", "Description", "IsActive")
VALUES
    ('All License', 'All license for personal, non-commercial use.', TRUE),
ON CONFLICT ("LicenseName") DO UPDATE
SET "Description" = EXCLUDED."Description",
    "IsActive" = TRUE;