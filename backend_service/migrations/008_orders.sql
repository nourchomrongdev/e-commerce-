
/* =========================================================
   008_orders.sql
   Module: 06-order-delivery
   ========================================================= */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'order_status'
    ) THEN
        CREATE TYPE order_status AS ENUM (
            'pending',
            'paid',
            'processing',
            'completed',
            'cancelled',
            'refunded',
            'partially_refunded',
            'failed'
        );
    END IF;
END $$;


CREATE TABLE "Orders" (
    "OrderId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE RESTRICT,

    "OrderNumber" VARCHAR(50) NOT NULL UNIQUE,

    "Subtotal" NUMERIC(12,2) NOT NULL,

    "DiscountAmount" NUMERIC(12,2) NOT NULL
        DEFAULT 0,

    "TaxAmount" NUMERIC(12,2) NOT NULL
        DEFAULT 0,

    "TotalAmount" NUMERIC(12,2) NOT NULL,

    "Currency" CHAR(3) NOT NULL
        DEFAULT 'USD',

    "Status" order_status NOT NULL
        DEFAULT 'pending',

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    "UpdatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Orders_Subtotal_NonNegative"
        CHECK ("Subtotal" >= 0),

    CONSTRAINT "CK_Orders_Discount_NonNegative"
        CHECK ("DiscountAmount" >= 0),

    CONSTRAINT "CK_Orders_Tax_NonNegative"
        CHECK ("TaxAmount" >= 0),

    CONSTRAINT "CK_Orders_Total_NonNegative"
        CHECK ("TotalAmount" >= 0)
);


CREATE TABLE "OrderItems" (
    "OrderItemId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "OrderId" BIGINT NOT NULL
        REFERENCES "Orders"("OrderId")
        ON DELETE CASCADE,

    "ProductId" INT NOT NULL
        REFERENCES "Products"("ProductId")
        ON DELETE RESTRICT,

    "StorefrontId" INT NOT NULL
        REFERENCES "Storefronts"("StorefrontId")
        ON DELETE RESTRICT,

    "ProductName" VARCHAR(255) NOT NULL,

    "Quantity" INT NOT NULL
        DEFAULT 1,

    "UnitPrice" NUMERIC(12,2) NOT NULL,

    "DiscountAmount" NUMERIC(12,2) NOT NULL
        DEFAULT 0,

    "TotalAmount" NUMERIC(12,2) NOT NULL,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_OrderItems_Quantity_Positive"
        CHECK ("Quantity" > 0),

    CONSTRAINT "CK_OrderItems_UnitPrice_NonNegative"
        CHECK ("UnitPrice" >= 0),

    CONSTRAINT "CK_OrderItems_Discount_NonNegative"
        CHECK ("DiscountAmount" >= 0),

    CONSTRAINT "CK_OrderItems_Total_NonNegative"
        CHECK ("TotalAmount" >= 0)
);


CREATE INDEX "IX_Orders_UserId"
ON "Orders" ("UserId");

CREATE INDEX "IX_Orders_Status"
ON "Orders" ("Status");

CREATE INDEX "IX_Orders_CreatedAt"
ON "Orders" ("CreatedAt");

CREATE INDEX "IX_OrderItems_OrderId"
ON "OrderItems" ("OrderId");

CREATE INDEX "IX_OrderItems_ProductId"
ON "OrderItems" ("ProductId");

CREATE INDEX "IX_OrderItems_StorefrontId"
ON "OrderItems" ("StorefrontId");


CREATE TRIGGER "TR_Orders_SetUpdatedAt"
BEFORE UPDATE ON "Orders"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
