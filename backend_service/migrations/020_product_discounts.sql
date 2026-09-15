ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS "DiscountPercent" NUMERIC(5,2) NOT NULL DEFAULT 0;

ALTER TABLE "Products"
ADD CONSTRAINT "CK_Products_DiscountPercent_Range"
CHECK ("DiscountPercent" >= 0 AND "DiscountPercent" <= 100);