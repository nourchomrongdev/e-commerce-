ALTER TABLE "CardInfo"
ADD COLUMN IF NOT EXISTS "StorefrontId" INT
REFERENCES "Storefronts"("StorefrontId") ON DELETE CASCADE;

UPDATE "CardInfo" AS card
SET "StorefrontId" = storefront."StorefrontId"
FROM "CreatorProfiles" AS profile
JOIN "Storefronts" AS storefront
  ON storefront."CreatorProfileId" = profile."CreatorProfileId"
WHERE card."CreatorProfileId" = profile."CreatorProfileId"
  AND card."StorefrontId" IS NULL;

CREATE INDEX IF NOT EXISTS "IX_CardInfo_StorefrontId"
ON "CardInfo" ("StorefrontId");
