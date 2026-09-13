-- Check CreatorProfiles
SELECT "CreatorProfileId", "UserId", "StorefrontName" FROM "CreatorProfiles" LIMIT 10;

-- Check if CardInfo table exists and has the UUID field
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'CardInfo' AND column_name = 'UUID';

-- Check current CardInfo records
SELECT "CardInfoId", "CreatorProfileId", "UUID" FROM "CardInfo" LIMIT 10;

-- Check constraints on CardInfo
SELECT constraint_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_name = 'CardInfo';
