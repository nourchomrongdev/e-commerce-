
/* =========================================================
   003_creator_storefront.sql
   Creator profile and storefront schema aligned to the creator
   program application form and marketplace storefront flow.
   ========================================================= */

CREATE TABLE IF NOT EXISTS "CreatorProfiles" (
    "CreatorProfileId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "UserId" INT NOT NULL UNIQUE
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "DisplayName" VARCHAR(150) NOT NULL,
    "Username" VARCHAR(100) NOT NULL UNIQUE,
    "PhoneNumber" VARCHAR(50),
    "Bio" TEXT,
    "WebsiteUrl" TEXT,
    "AvatarUrl" TEXT,
    "BannerUrl" TEXT,
    "SocialLinks" JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    "IsVerified" BOOLEAN NOT NULL
        DEFAULT FALSE,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_CreatorProfiles_DisplayName_NotBlank"
        CHECK (btrim("DisplayName") <> ''),

    CONSTRAINT "CK_CreatorProfiles_Username_NotBlank"
        CHECK (btrim("Username") <> '')
);

ALTER TABLE "CreatorProfiles"
    ADD COLUMN IF NOT EXISTS "PhoneNumber" VARCHAR(50),
    ADD COLUMN IF NOT EXISTS "Bio" TEXT,
    ADD COLUMN IF NOT EXISTS "WebsiteUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "AvatarUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "BannerUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "SocialLinks" JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS "Storefronts" (
    "StorefrontId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "CreatorProfileId" INT NOT NULL UNIQUE
        REFERENCES "CreatorProfiles"("CreatorProfileId")
        ON DELETE CASCADE,

    "StoreName" VARCHAR(150) NOT NULL,
    "StoreSlug" VARCHAR(150) NOT NULL UNIQUE,
    "Description" TEXT,
    "LogoUrl" TEXT,
    "BannerUrl" TEXT,
    "WebsiteUrl" TEXT,
    "ThemeSettings" JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    "IsPublished" BOOLEAN NOT NULL
        DEFAULT FALSE,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Storefronts_StoreName_NotBlank"
        CHECK (btrim("StoreName") <> ''),

    CONSTRAINT "CK_Storefronts_StoreSlug_NotBlank"
        CHECK (btrim("StoreSlug") <> '')
);

CREATE TABLE IF NOT EXISTS "CreatorPayoutInfo" (
    "CreatorPayoutInfoId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "CreatorProfileId" INT NOT NULL UNIQUE
        REFERENCES "CreatorProfiles"("CreatorProfileId")
        ON DELETE CASCADE,

    "PayoutMethod" VARCHAR(50) NOT NULL,
    "AccountName" VARCHAR(255),
    "AccountIdentifier" TEXT,
    "Currency" CHAR(3) NOT NULL
        DEFAULT 'USD',

    "IsVerified" BOOLEAN NOT NULL
        DEFAULT FALSE,

    "IsActive" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IX_Storefronts_IsPublished"
ON "Storefronts" ("IsPublished");

CREATE INDEX IF NOT EXISTS "IX_Storefronts_IsActive"
ON "Storefronts" ("IsActive");

CREATE INDEX IF NOT EXISTS "IX_CreatorProfiles_IsVerified"
ON "CreatorProfiles" ("IsVerified");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'TR_CreatorProfiles_SetUpdatedAt'
    ) THEN
        CREATE TRIGGER "TR_CreatorProfiles_SetUpdatedAt"
        BEFORE UPDATE ON "CreatorProfiles"
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'TR_Storefronts_SetUpdatedAt'
    ) THEN
        CREATE TRIGGER "TR_Storefronts_SetUpdatedAt"
        BEFORE UPDATE ON "Storefronts"
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'TR_CreatorPayoutInfo_SetUpdatedAt'
    ) THEN
        CREATE TRIGGER "TR_CreatorPayoutInfo_SetUpdatedAt"
        BEFORE UPDATE ON "CreatorPayoutInfo"
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
