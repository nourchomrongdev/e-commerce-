ALTER TABLE "Licenses"
    ALTER COLUMN "LicenseKey" TYPE TEXT;

ALTER TABLE "Licenses"
    ADD COLUMN IF NOT EXISTS "LicenseKeyHash" VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_Licenses_LicenseKeyHash"
    ON "Licenses" ("LicenseKeyHash")
    WHERE "LicenseKeyHash" IS NOT NULL;