
/* =========================================================
   003_creator_storefront.sql
   Module: 03-creator-storefront
   ========================================================= */

CREATE TABLE "CreatorProfiles" (
    "CreatorProfileId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "UserId" INT NOT NULL UNIQUE
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "DisplayName" VARCHAR(150) NOT NULL,

    "Username" VARCHAR(100) NOT NULL UNIQUE,

    "Bio" TEXT,

    "AvatarUrl" TEXT,

    "BannerUrl" TEXT,

    "WebsiteUrl" TEXT,

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


CREATE TABLE "Storefronts" (
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


CREATE TABLE "CreatorPayoutInfo" (
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


CREATE INDEX "IX_Storefronts_IsPublished"
ON "Storefronts" ("IsPublished");

CREATE INDEX "IX_Storefronts_IsActive"
ON "Storefronts" ("IsActive");

CREATE INDEX "IX_CreatorProfiles_IsVerified"
ON "CreatorProfiles" ("IsVerified");


CREATE TRIGGER "TR_CreatorProfiles_SetUpdatedAt"
BEFORE UPDATE ON "CreatorProfiles"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_Storefronts_SetUpdatedAt"
BEFORE UPDATE ON "Storefronts"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_CreatorPayoutInfo_SetUpdatedAt"
BEFORE UPDATE ON "CreatorPayoutInfo"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
