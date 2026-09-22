CREATE TABLE IF NOT EXISTS "ProductVersionLicenses" (
    "ProductVersionLicenseId" BIGSERIAL PRIMARY KEY,
    "ProductVersionId" BIGINT NOT NULL REFERENCES "ProductVersions"("ProductVersionId") ON DELETE CASCADE,
    "LicenseTypeId" INT NOT NULL REFERENCES "LicenseTypes"("LicenseTypeId") ON DELETE RESTRICT,
    "Price" NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK ("Price" >= 0),
    "AccessType" VARCHAR(40) NOT NULL DEFAULT 'Lifetime Access',
    "DownloadLimit" INT NULL CHECK ("DownloadLimit" IS NULL OR "DownloadLimit" > 0),
    CONSTRAINT "UQ_ProductVersionLicenses_Version_License" UNIQUE ("ProductVersionId", "LicenseTypeId")
);

CREATE INDEX IF NOT EXISTS "IX_ProductVersionLicenses_ProductVersionId"
ON "ProductVersionLicenses" ("ProductVersionId");

INSERT INTO "ProductVersionLicenses" ("ProductVersionId", "LicenseTypeId", "Price")
SELECT "ProductVersionId", "LicenseTypeId", "Price"
FROM "ProductVersions"
WHERE "LicenseTypeId" IS NOT NULL
ON CONFLICT ("ProductVersionId", "LicenseTypeId") DO NOTHING;
