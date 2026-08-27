-- Database: digital_product


/* =========================
   USER ROLES
========================= */
CREATE TABLE UsersRoles (
    UserRoleId SERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    RoleName VARCHAR(255) NOT NULL
);