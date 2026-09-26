UPDATE "LicenseRules"
SET "RuleName" = LOWER("RuleName"),
    "Description" = LOWER("Description");
