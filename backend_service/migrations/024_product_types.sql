CREATE TABLE IF NOT EXISTS "ProductTypes" (
    "ProductTypeId" SERIAL PRIMARY KEY,
    "TypeName" VARCHAR(100) NOT NULL UNIQUE,
    "Description" TEXT,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "ProductTypes" ("TypeName", "Description")
VALUES
    ('Digital Download', 'Files customers can download.'),
    ('Online Course', 'Video lessons and course materials.'),
    ('License / Key', 'Software license or product key.')
ON CONFLICT ("TypeName") DO UPDATE
SET "Description" = EXCLUDED."Description",
    "IsActive" = TRUE;

CREATE INDEX IF NOT EXISTS "IX_Categories_ParentCategoryId"
ON "Categories" ("ParentCategoryId");