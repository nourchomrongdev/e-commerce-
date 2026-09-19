DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT con.conname
    INTO constraint_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute attr ON attr.attrelid = rel.oid AND attr.attnum = ANY(con.conkey)
    WHERE rel.relname = 'Storefronts'
      AND con.contype = 'u'
      AND attr.attname = 'CreatorProfileId'
    LIMIT 1;

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "Storefronts" DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

DROP INDEX IF EXISTS "Storefronts_CreatorProfileId_key";
CREATE INDEX IF NOT EXISTS "IX_Storefronts_CreatorProfileId"
ON "Storefronts" ("CreatorProfileId");
