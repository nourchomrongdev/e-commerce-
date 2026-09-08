
/* =========================================================
   001_roles_permissions.sql

   Module:
       01-role-permission

   Includes:
       UsersRoles
       UserInfo
       UserAccounts
       UserAccountRoles
       OAuthAccounts
       Permissions
       RolePermissions
   ========================================================= */

CREATE EXTENSION IF NOT EXISTS pgcrypto;


/* =========================================================
   ENUMS
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'account_status'
    ) THEN
        CREATE TYPE account_status AS ENUM (
            'active',
            'inactive',
            'suspended',
            'banned'
        );
    END IF;
END $$;


/* =========================================================
   USERS ROLES
   ========================================================= */

CREATE TABLE "UsersRoles" (
    "UserRoleId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "RoleName" VARCHAR(100) NOT NULL
        UNIQUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_UsersRoles_RoleName_NotBlank"
        CHECK (btrim("RoleName") <> '')
);


/* =========================================================
   USER INFORMATION
   ========================================================= */

CREATE TABLE "UserInfo" (
    "UserInfoId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "FullName" VARCHAR(255),

    "Email" VARCHAR(255) NOT NULL
        UNIQUE,

    "Phone" VARCHAR(50),

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_UserInfo_Email_NotBlank"
        CHECK (btrim("Email") <> '')
);


/* =========================================================
   USER ACCOUNTS
   ========================================================= */

CREATE TABLE "UserAccounts" (
    "UserId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "UserInfoId" INT NOT NULL
        UNIQUE
        REFERENCES "UserInfo"("UserInfoId")
        ON DELETE CASCADE,

    "Username" VARCHAR(255)
        UNIQUE,

    "PasswordHash" VARCHAR(255),

    "Status" account_status NOT NULL
        DEFAULT 'active',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_UserAccounts_Username_NotBlank"
        CHECK (
            "Username" IS NULL
            OR btrim("Username") <> ''
        ),

    CONSTRAINT "CK_UserAccounts_PasswordHash_NotBlank"
        CHECK (
            "PasswordHash" IS NULL
            OR btrim("PasswordHash") <> ''
        )
);


/* =========================================================
   USER ACCOUNT ROLES
   Many-to-many
   ========================================================= */

CREATE TABLE "UserAccountRoles" (
    "UserAccountRoleId" SERIAL PRIMARY KEY,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "UserRoleId" INT NOT NULL
        REFERENCES "UsersRoles"("UserRoleId")
        ON DELETE RESTRICT,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UQ_UserAccountRoles_User_Role"
        UNIQUE ("UserId", "UserRoleId")
);


/* =========================================================
   OAUTH ACCOUNTS
   ========================================================= */

CREATE TABLE "OAuthAccounts" (
    "OAuthAccountId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "Provider" VARCHAR(50) NOT NULL,

    "ProviderAccountId" VARCHAR(255) NOT NULL,

    "ProviderEmail" VARCHAR(255),

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "AccessToken" TEXT,

    "RefreshToken" TEXT,

    "TokenExpiresAt" TIMESTAMPTZ,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_OAuthAccounts_Provider_NotBlank"
        CHECK (btrim("Provider") <> ''),

    CONSTRAINT "CK_OAuthAccounts_ProviderAccountId_NotBlank"
        CHECK (btrim("ProviderAccountId") <> ''),

    CONSTRAINT "UQ_OAuthAccounts_Provider"
        UNIQUE ("Provider", "ProviderAccountId")
);


/* =========================================================
   PERMISSIONS
   ========================================================= */

CREATE TABLE "Permissions" (
    "PermissionId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "PermissionName" VARCHAR(150) NOT NULL
        UNIQUE,

    "Description" TEXT,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Permissions_Name_NotBlank"
        CHECK (btrim("PermissionName") <> '')
);


/* =========================================================
   ROLE PERMISSIONS
   ========================================================= */

CREATE TABLE "RolePermissions" (
    "RolePermissionId" SERIAL PRIMARY KEY,

    "UserRoleId" INT NOT NULL
        REFERENCES "UsersRoles"("UserRoleId")
        ON DELETE CASCADE,

    "PermissionId" INT NOT NULL
        REFERENCES "Permissions"("PermissionId")
        ON DELETE CASCADE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UQ_RolePermissions_Role_Permission"
        UNIQUE ("UserRoleId", "PermissionId")
);


/* =========================================================
   INDEXES
   ========================================================= */

CREATE INDEX "IX_UserAccountRoles_UserId"
ON "UserAccountRoles" ("UserId");

CREATE INDEX "IX_UserAccountRoles_UserRoleId"
ON "UserAccountRoles" ("UserRoleId");

CREATE INDEX "IX_OAuthAccounts_UserId"
ON "OAuthAccounts" ("UserId");

CREATE INDEX "IX_OAuthAccounts_Provider"
ON "OAuthAccounts" ("Provider");

CREATE INDEX "IX_RolePermissions_UserRoleId"
ON "RolePermissions" ("UserRoleId");

CREATE INDEX "IX_RolePermissions_PermissionId"
ON "RolePermissions" ("PermissionId");

CREATE UNIQUE INDEX "UX_UserInfo_Email_Lower"
ON "UserInfo" (lower("Email"));

CREATE UNIQUE INDEX "UX_OAuthAccounts_Provider_Lower"
ON "OAuthAccounts"
(
    lower("Provider"),
    "ProviderAccountId"
);


/* =========================================================
   UPDATED_AT FUNCTION
   ========================================================= */

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


/* =========================================================
   TRIGGERS
   ========================================================= */

CREATE TRIGGER "TR_UserInfo_SetUpdatedAt"
BEFORE UPDATE ON "UserInfo"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_UserAccounts_SetUpdatedAt"
BEFORE UPDATE ON "UserAccounts"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_OAuthAccounts_SetUpdatedAt"
BEFORE UPDATE ON "OAuthAccounts"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


/* =========================================================
   DEFAULT ROLES
   ========================================================= */

INSERT INTO "UsersRoles" ("RoleName")
VALUES
    ('Buyer'),
    ('Creator'),
    ('Affiliate'),
    ('Reviewer'),
    ('Admin'),
    ('Superadmin')
ON CONFLICT ("RoleName") DO NOTHING;
