
/* =========================================================
   011_licenses.sql
   Module: 05-license-drm
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'license_status'
    ) THEN
        CREATE TYPE license_status AS ENUM (
            'active',
            'expired',
            'revoked',
            'suspended'
        );
    END IF;
END $$;


CREATE TABLE "LicenseTypes" (
    "LicenseTypeId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "LicenseName" VARCHAR(100) NOT NULL UNIQUE,

    "Description" TEXT,

    "MaxActivations" INT,

    "DurationDays" INT,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    CONSTRAINT "CK_LicenseTypes_MaxActivations"
        CHECK (
            "MaxActivations" IS NULL
            OR "MaxActivations" > 0
        ),

    CONSTRAINT "CK_LicenseTypes_DurationDays"
        CHECK (
            "DurationDays" IS NULL
            OR "DurationDays" > 0
        )
);


CREATE TABLE "Licenses" (
    "LicenseId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "LicenseKey" VARCHAR(255) NOT NULL UNIQUE,

    "OrderItemId" BIGINT NOT NULL
        REFERENCES "OrderItems"("OrderItemId")
        ON DELETE RESTRICT,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE RESTRICT,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE RESTRICT,

    "LicenseTypeId" INT
        REFERENCES "LicenseTypes"("LicenseTypeId")
        ON DELETE SET NULL,

    "Status" license_status NOT NULL
        DEFAULT 'active',

    "IssuedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "ExpiresAt" TIMESTAMPTZ,

    "RevokedAt" TIMESTAMPTZ,

    "RevocationReason" TEXT,

    "Metadata" JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    CONSTRAINT "CK_Licenses_Key_NotBlank"
        CHECK (btrim("LicenseKey") <> '')
);


CREATE INDEX "IX_Licenses_OrderItemId"
ON "Licenses" ("OrderItemId");

CREATE INDEX "IX_Licenses_ProductId"
ON "Licenses" ("ProductId");

CREATE INDEX "IX_Licenses_UserId"
ON "Licenses" ("UserId");

CREATE INDEX "IX_Licenses_Status"
ON "Licenses" ("Status");

CREATE INDEX "IX_Licenses_ExpiresAt"
ON "Licenses" ("ExpiresAt");
