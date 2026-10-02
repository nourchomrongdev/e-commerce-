ALTER TABLE "UserAccounts"
    ADD COLUMN IF NOT EXISTS "LicenseRevealOtpHash" VARCHAR(64),
    ADD COLUMN IF NOT EXISTS "LicenseRevealOtpExpiresAt" TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS "LicenseRevealOtpAttempts" INT NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'CK_UserAccounts_LicenseRevealOtpAttempts_NonNegative'
    ) THEN
        ALTER TABLE "UserAccounts"
            ADD CONSTRAINT "CK_UserAccounts_LicenseRevealOtpAttempts_NonNegative"
            CHECK ("LicenseRevealOtpAttempts" >= 0);
    END IF;
END $$;