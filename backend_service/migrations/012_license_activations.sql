
/* =========================================================
   012_license_activations.sql
   Module: 05-license-drm
   ========================================================= */

CREATE TABLE "LicenseActivations" (
    "ActivationId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "LicenseId" BIGINT NOT NULL
        REFERENCES "Licenses"("LicenseId")
        ON DELETE CASCADE,

    "DeviceIdentifierHash" VARCHAR(255) NOT NULL,

    "DeviceName" VARCHAR(255),

    "IPAddress" INET,

    "UserAgent" TEXT,

    "ActivatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "LastValidatedAt" TIMESTAMPTZ,

    "DeactivatedAt" TIMESTAMPTZ,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    CONSTRAINT "UQ_LicenseActivations_Device"
        UNIQUE ("LicenseId", "DeviceIdentifierHash")
);

CREATE INDEX "IX_LicenseActivations_LicenseId"
ON "LicenseActivations" ("LicenseId");

CREATE INDEX "IX_LicenseActivations_IsActive"
ON "LicenseActivations" ("IsActive");

CREATE INDEX "IX_LicenseActivations_LastValidatedAt"
ON "LicenseActivations" ("LastValidatedAt");
