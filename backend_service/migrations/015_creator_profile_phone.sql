/* Add creator-program contact number to existing CreatorProfiles tables. */

ALTER TABLE "CreatorProfiles"
ADD COLUMN IF NOT EXISTS "PhoneNumber" VARCHAR(50);