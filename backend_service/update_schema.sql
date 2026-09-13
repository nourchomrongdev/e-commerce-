-- Alter CardExpiry and CardBrand columns to TEXT to accommodate encrypted values
ALTER TABLE "CardInfo" ALTER COLUMN "CardExpiry" TYPE TEXT;
ALTER TABLE "CardInfo" ALTER COLUMN "CardBrand" TYPE TEXT;

SELECT 'Schema update complete - CardExpiry and CardBrand are now TEXT';
