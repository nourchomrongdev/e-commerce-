CREATE TABLE IF NOT EXISTS "CardInfo" (
    "CardInfoId" SERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "CreatorProfileId" INT NOT NULL
        REFERENCES "CreatorProfiles"("CreatorProfileId")
        ON DELETE CASCADE,

    "CardName" VARCHAR(255),
    "CardNumber" TEXT,
    "CardExpiry" TEXT,
    "CardCvc" TEXT,
    "CardBrand" TEXT,
    "Provider" VARCHAR(50) NOT NULL
        DEFAULT 'PayPal',
    "StripePaymentMethodId" VARCHAR(255),
    "Methods" JSONB NOT NULL
        DEFAULT '[]'::jsonb,
    "PrimaryMethod" VARCHAR(50),
    "TaxId" VARCHAR(255),
    "PaypalEmail" VARCHAR(255),
    "StripeEmail" VARCHAR(255),
    "StripeAccountId" VARCHAR(255),
    "Metadata" JSONB NOT NULL
        DEFAULT '{}'::jsonb,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IX_CardInfo_CreatorProfileId"
ON "CardInfo" ("CreatorProfileId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'TR_CardInfo_SetUpdatedAt'
    ) THEN
        CREATE TRIGGER "TR_CardInfo_SetUpdatedAt"
        BEFORE UPDATE ON "CardInfo"
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;
