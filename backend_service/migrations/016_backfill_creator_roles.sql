/* =========================================================
   016_backfill_creator_roles.sql

   Add Creator as an additional role for approved accounts without
   changing UserAccounts.RoleId, which remains the primary role.
   ========================================================= */

INSERT INTO "UserAccountRoles" ("UserId", "UserRoleId")
SELECT DISTINCT profile."UserId", creator."UserRoleId"
FROM "CreatorProfiles" profile
JOIN "UsersRoles" creator
    ON creator."RoleName" = 'Creator'
LEFT JOIN "UserAccountRoles" existing
    ON existing."UserId" = profile."UserId"
   AND existing."UserRoleId" = creator."UserRoleId"
WHERE profile."IsVerified" = TRUE
  AND existing."UserAccountRoleId" IS NULL;

INSERT INTO "UserAccountRoles" ("UserId", "UserRoleId")
SELECT account."UserId", account."RoleId"
FROM "UserAccounts" account
LEFT JOIN "UserAccountRoles" existing
    ON existing."UserId" = account."UserId"
   AND existing."UserRoleId" = account."RoleId"
WHERE existing."UserAccountRoleId" IS NULL;
