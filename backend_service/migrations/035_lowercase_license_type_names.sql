BEGIN;

CREATE TEMP TABLE license_type_name_map ON COMMIT DROP AS
SELECT
    "LicenseTypeId" AS license_type_id,
    FIRST_VALUE("LicenseTypeId") OVER (
        PARTITION BY lower(btrim("LicenseName"))
        ORDER BY "LicenseTypeId"
    ) AS canonical_id
FROM "LicenseTypes";

DELETE FROM "ProductVersionLicenses" duplicate
USING license_type_name_map mapping, license_type_name_map other_mapping
WHERE duplicate."LicenseTypeId" = mapping.license_type_id
  AND other_mapping.canonical_id = mapping.canonical_id
  AND EXISTS (
      SELECT 1
      FROM "ProductVersionLicenses" earlier
      WHERE earlier."ProductVersionId" = duplicate."ProductVersionId"
        AND earlier."LicenseTypeId" = other_mapping.license_type_id
        AND earlier."ProductVersionLicenseId" < duplicate."ProductVersionLicenseId"
  );

UPDATE "ProductVersionLicenses" version_license
SET "LicenseTypeId" = mapping.canonical_id
FROM license_type_name_map mapping
WHERE version_license."LicenseTypeId" = mapping.license_type_id
  AND mapping.license_type_id <> mapping.canonical_id;

UPDATE "Licenses" license
SET "LicenseTypeId" = mapping.canonical_id
FROM license_type_name_map mapping
WHERE license."LicenseTypeId" = mapping.license_type_id
  AND mapping.license_type_id <> mapping.canonical_id;

UPDATE "ProductVersions" version
SET "LicenseTypeId" = mapping.canonical_id
FROM license_type_name_map mapping
WHERE version."LicenseTypeId" = mapping.license_type_id
  AND mapping.license_type_id <> mapping.canonical_id;

UPDATE "LicenseRules" rule
SET "AppliesTo" = (
    SELECT COALESCE(
        jsonb_agg(DISTINCT COALESCE(mapping.canonical_id, rule_type.license_type_id::INT)),
        '[]'::jsonb
    )::TEXT
    FROM jsonb_array_elements_text(rule."AppliesTo"::jsonb) AS rule_type(license_type_id)
    LEFT JOIN license_type_name_map mapping
        ON mapping.license_type_id = rule_type.license_type_id::INT
)
WHERE btrim(rule."AppliesTo") LIKE '[%';

DELETE FROM "LicenseTypes" license_type
USING license_type_name_map mapping
WHERE license_type."LicenseTypeId" = mapping.license_type_id
  AND mapping.license_type_id <> mapping.canonical_id;

UPDATE "LicenseTypes"
SET "LicenseName" = lower(btrim("LicenseName"))
WHERE "LicenseName" IS DISTINCT FROM lower(btrim("LicenseName"));

CREATE OR REPLACE FUNCTION normalize_license_type_name_lowercase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."LicenseName" := lower(btrim(NEW."LicenseName"));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "TR_LicenseTypes_NormalizeNameLowercase" ON "LicenseTypes";
CREATE TRIGGER "TR_LicenseTypes_NormalizeNameLowercase"
BEFORE INSERT OR UPDATE OF "LicenseName" ON "LicenseTypes"
FOR EACH ROW
EXECUTE FUNCTION normalize_license_type_name_lowercase();

COMMIT;
