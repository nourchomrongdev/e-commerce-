-- Clear old payment data
UPDATE "CreatorPayoutInfo" SET "AccountIdentifier" = NULL WHERE "CreatorProfileId" = 1;
DELETE FROM "CardInfo" WHERE "CreatorProfileId" = 1;
SELECT 'Cleared old payment data for CreatorProfileId 1';
