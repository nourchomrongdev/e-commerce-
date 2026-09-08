
/* =========================================================
   010_order_delivery.sql
   Module: 06-order-delivery
   ========================================================= */

CREATE TABLE "Downloads" (
    "DownloadId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "OrderItemId" BIGINT NOT NULL
        REFERENCES "OrderItems"("OrderItemId")
        ON DELETE CASCADE,

    "ProductFileId" BIGINT NOT NULL
        REFERENCES "ProductFiles"("ProductFileId")
        ON DELETE RESTRICT,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "TokenHash" VARCHAR(255),

    "ExpiresAt" TIMESTAMPTZ,

    "DownloadedAt" TIMESTAMPTZ,

    "IPAddress" INET,

    "UserAgent" TEXT,

    "DownloadCount" INT NOT NULL
        DEFAULT 0,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CK_Downloads_Count_NonNegative"
        CHECK ("DownloadCount" >= 0)
);


CREATE TABLE "OrderDeliveries" (
    "OrderDeliveryId" BIGSERIAL PRIMARY KEY,

    "UUID" UUID NOT NULL
        DEFAULT gen_random_uuid()
        UNIQUE,

    "OrderId" BIGINT NOT NULL
        REFERENCES "Orders"("OrderId")
        ON DELETE CASCADE,

    "UserId" INT NOT NULL
        REFERENCES "UserAccounts"("UserId")
        ON DELETE CASCADE,

    "DeliveryStatus" VARCHAR(50) NOT NULL
        DEFAULT 'available',

    "DeliveredAt" TIMESTAMPTZ,

    "CreatedAt" TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX "IX_Downloads_OrderItemId"
ON "Downloads" ("OrderItemId");

CREATE INDEX "IX_Downloads_ProductFileId"
ON "Downloads" ("ProductFileId");

CREATE INDEX "IX_Downloads_UserId"
ON "Downloads" ("UserId");

CREATE INDEX "IX_Downloads_ExpiresAt"
ON "Downloads" ("ExpiresAt");

CREATE INDEX "IX_OrderDeliveries_OrderId"
ON "OrderDeliveries" ("OrderId");

CREATE INDEX "IX_OrderDeliveries_UserId"
ON "OrderDeliveries" ("UserId");
