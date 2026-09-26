ALTER TABLE "LicenseTypes"
ADD COLUMN IF NOT EXISTS "StorefrontId" INT
REFERENCES "Storefronts"("StorefrontId")
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "IX_LicenseTypes_StorefrontId"
ON "LicenseTypes" ("StorefrontId");

CREATE TABLE IF NOT EXISTS "LicenseRules" (
    "LicenseRuleId" BIGSERIAL PRIMARY KEY,
    "UUID" UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    "StorefrontId" INT NOT NULL REFERENCES "Storefronts"("StorefrontId") ON DELETE CASCADE,
    "RuleName" VARCHAR(150) NOT NULL,
    "AppliesTo" VARCHAR(255) NOT NULL DEFAULT 'All Licenses',
    "RuleType" VARCHAR(50) NOT NULL DEFAULT 'Restriction',
    "Description" TEXT NOT NULL DEFAULT '',
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UQ_LicenseRules_Storefront_Name" UNIQUE ("StorefrontId", "RuleName")
);

CREATE INDEX IF NOT EXISTS "IX_LicenseRules_StorefrontId"
ON "LicenseRules" ("StorefrontId");
