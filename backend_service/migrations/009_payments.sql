
/* =========================================================
   009_payments.sql
   Module: 06-order-delivery
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_status'
    ) THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',
            'authorized',
            'paid',
            'failed',
            'cancelled',
            'refunded',
            'partially_refunded'
        );
    END IF;
END $$;


CREATE TABLE "Payments" (
    "PaymentId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "OrderId" BIGINT NOT NULL
        REFERENCES "Orders"("OrderId")
        ON DELETE RESTRICT,

    "PaymentMethod" VARCHAR(50) NOT NULL,

    "TransactionId" VARCHAR(255),

    "Amount" NUMERIC(12,2) NOT NULL,

    "Currency" CHAR(3) NOT NULL
        DEFAULT 'USD',

    "Status" payment_status NOT NULL
        DEFAULT 'pending',

    "PaidAt" TIMESTAMPTZ,

    "ProviderResponse" JSONB
        DEFAULT '{}'::jsonb,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Payments_Amount_NonNegative"
        CHECK ("Amount" >= 0)
);

CREATE INDEX "IX_Payments_OrderId"
ON "Payments" ("OrderId");

CREATE INDEX "IX_Payments_Status"
ON "Payments" ("Status");

CREATE UNIQUE INDEX "UX_Payments_TransactionId"
ON "Payments" ("TransactionId")
WHERE "TransactionId" IS NOT NULL;

CREATE TRIGGER "TR_Payments_SetUpdatedAt"
BEFORE UPDATE ON "Payments"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

