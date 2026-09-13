-- Remove UNIQUE constraint on CreatorProfileId to allow multiple cards per creator
-- First, drop the unique constraint
ALTER TABLE "CardInfo" DROP CONSTRAINT "CardInfo_CreatorProfileId_key";

-- Add a regular index for faster lookups
CREATE INDEX IF NOT EXISTS "IX_CardInfo_CreatorProfileId" ON "CardInfo"("CreatorProfileId");

SELECT 'Updated CardInfo table to support multiple cards per creator';
