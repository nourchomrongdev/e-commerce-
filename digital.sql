/* =========================================================
   DROP EXISTING TABLES
========================================================= */

DROP TABLE IF EXISTS
    "OAuthAccounts",
    "UserAccounts",
    "UserInfo",
    "UsersRoles"
CASCADE;


/* =========================================================
   UUID EXTENSION
========================================================= */

CREATE EXTENSION IF NOT EXISTS pgcrypto;


/* =========================================================
   USER ROLES
========================================================= */

CREATE TABLE "UsersRoles" (
    "UserRoleId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "RoleName" VARCHAR(100) NOT NULL
        UNIQUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


/* =========================================================
   USER INFORMATION
   Personal/profile information
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
   Authentication + role information
========================================================= */

CREATE TABLE "UserAccounts" (
    "UserId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    /* Link to user profile */
    "UserInfoId" INT NOT NULL
        UNIQUE
        REFERENCES "UserInfo"("UserInfoId")
        ON DELETE CASCADE,

    /*
        Username is optional.

        Normal registration:
            Username = nour

        OAuth registration:
            Username = NULL
    */
    "Username" VARCHAR(255)
        UNIQUE,

    /*
        NULL = OAuth-only account

        NOT NULL = account has a password
    */
    "PasswordHash" VARCHAR(255),

    /* User role */
    "RoleId" INT NOT NULL
        REFERENCES "UsersRoles"("UserRoleId")
        ON DELETE RESTRICT,

    /* Account status */
    "Status" BOOLEAN NOT NULL
        DEFAULT TRUE,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_UserAccounts_PasswordHash_NotBlank"
        CHECK ("PasswordHash" IS NULL OR btrim("PasswordHash") <> '')
);


/* =========================================================
   OAUTH ACCOUNTS
   Google / GitHub / Facebook / etc.
========================================================= */

CREATE TABLE "OAuthAccounts" (
    "OAuthAccountId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    /*
        Example:
        Google
        GitHub
        Facebook
        Apple
    */
    "Provider" VARCHAR(50) NOT NULL,

    /*
        The unique ID provided by OAuth provider.

        Google:
            sub

        GitHub:
            user ID
    */
    "ProviderAccountId" VARCHAR(255) NOT NULL,

    /*
        Email returned by OAuth provider.
        This is NOT the primary user identity.
    */
    "ProviderEmail" VARCHAR(255),

    /*
        Main user account
    */
    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    /*
        OAuth tokens.
        Store securely if your application actually needs them.
    */
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

    /*
        One OAuth identity can only belong to one account.

        Example:
        Google + 123456
    */
    CONSTRAINT "UQ_OAuthAccounts_Provider"
        UNIQUE ("Provider", "ProviderAccountId")
);


/* =========================================================
   INDEXES
========================================================= */

CREATE INDEX "IX_UserAccounts_RoleId"
ON "UserAccounts" ("RoleId");

CREATE INDEX "IX_OAuthAccounts_UserId"
ON "OAuthAccounts" ("UserId");

CREATE INDEX "IX_OAuthAccounts_Provider"
ON "OAuthAccounts" ("Provider");

CREATE UNIQUE INDEX "UX_UserInfo_Email_Lower"
ON "UserInfo" (lower("Email"));

CREATE UNIQUE INDEX "UX_OAuthAccounts_Provider_Lower"
ON "OAuthAccounts" (lower("Provider"), "ProviderAccountId");


/* =========================================================
   AUTOMATIC UPDATE TIMESTAMPS
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

CREATE TRIGGER "TR_UserInfo_SetUpdatedAt"
BEFORE UPDATE ON "UserInfo"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_UserAccounts_SetUpdatedAt"
BEFORE UPDATE ON "UserAccounts"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "TR_OAuthAccounts_SetUpdatedAt"
BEFORE UPDATE ON "OAuthAccounts"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


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


/* =========================================================
    AUTHENTICATION QUERIES AND EXAMPLES

    PasswordHash values must be produced by the application with
    Argon2id (preferred) or bcrypt. Never pass or store plaintext.
    These are examples for a test transaction, not production seed data.
========================================================= */

-- A. Email registration: insert UserInfo, then UserAccounts with a
--    precomputed Argon2id/bcrypt hash and the Buyer role.
-- INSERT INTO "UserInfo" ("FullName", "Email")
-- VALUES ('Normal Email User', 'normal@example.com')
-- RETURNING "UserInfoId";
-- INSERT INTO "UserAccounts" ("UserInfoId", "PasswordHash", "RoleId")
-- VALUES (:user_info_id, :password_hash,
--         (SELECT "UserRoleId" FROM "UsersRoles" WHERE "RoleName" = 'Buyer'))
-- RETURNING "UserId";

-- B. OAuth registration: verify the provider identity first, then insert
--    UserInfo, UserAccounts with NULL PasswordHash, and OAuthAccounts.
-- INSERT INTO "UserInfo" ("FullName", "Email")
-- VALUES ('Google Only User', 'google@example.com')
-- RETURNING "UserInfoId";
-- INSERT INTO "UserAccounts" ("UserInfoId", "PasswordHash", "RoleId")
-- VALUES (:user_info_id, NULL,
--         (SELECT "UserRoleId" FROM "UsersRoles" WHERE "RoleName" = 'Buyer'))
-- RETURNING "UserId";
-- INSERT INTO "OAuthAccounts"
--     ("Provider", "ProviderAccountId", "ProviderEmail", "UserId")
-- VALUES ('google', :google_subject, 'google@example.com', :user_id);

-- C. Existing OAuth login.
-- SELECT ua.*, ui."FullName", ui."Email", ur."RoleName"
-- FROM "OAuthAccounts" oa
-- JOIN "UserAccounts" ua ON ua."UserId" = oa."UserId"
-- JOIN "UserInfo" ui ON ui."UserInfoId" = ua."UserInfoId"
-- JOIN "UsersRoles" ur ON ur."UserRoleId" = ua."RoleId"
-- WHERE lower(oa."Provider") = lower(:provider)
--   AND oa."ProviderAccountId" = :provider_account_id
--   AND ua."Status" = TRUE;

-- D. Add a password to the existing OAuth account.
-- UPDATE "UserAccounts"
-- SET "PasswordHash" = :password_hash
-- WHERE "UserId" = :authenticated_user_id
--   AND "PasswordHash" IS NULL;

-- E. Connect another provider to the same account.
-- INSERT INTO "OAuthAccounts"
--     ("Provider", "ProviderAccountId", "ProviderEmail", "UserId")
-- VALUES ('github', :github_id, 'google@example.com', :authenticated_user_id);

-- F. Email/password login. Verify the returned hash in the application.
-- SELECT ua."UserId", ua."PasswordHash", ua."RoleId", ur."RoleName"
-- FROM "UserInfo" ui
-- JOIN "UserAccounts" ua ON ua."UserInfoId" = ui."UserInfoId"
-- JOIN "UsersRoles" ur ON ur."UserRoleId" = ua."RoleId"
-- WHERE lower(ui."Email") = lower(:email)
--   AND ua."Status" = TRUE;

-- Example shapes: normal user (hash + Buyer), Google-only user (NULL hash +
-- Google identity), OAuth user later adding a hash on the same UserId, and
-- Google + GitHub identities stored as two OAuthAccounts rows sharing UserId.

-- Relationship: UserInfo 1:1 UserAccounts, UserAccounts 1:N OAuthAccounts,
-- and many UserAccounts can reference one UsersRoles row. CASCADE removes
-- identities with their account; RESTRICT preserves assigned roles.