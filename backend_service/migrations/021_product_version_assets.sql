/* Keep product files and previews attached to the release that introduced them. */
ALTER TABLE "ProductFiles" ADD COLUMN "ProductVersionId" BIGINT REFERENCES "ProductVersions"("ProductVersionId") ON DELETE CASCADE;
ALTER TABLE "ProductPreviews" ADD COLUMN "ProductVersionId" BIGINT REFERENCES "ProductVersions"("ProductVersionId") ON DELETE CASCADE;

UPDATE "ProductFiles" AS file
SET "ProductVersionId" = version."ProductVersionId"
FROM "ProductVersions" AS version
WHERE file."ProductId" = version."ProductId" AND version."IsCurrent" = TRUE;

UPDATE "ProductPreviews" AS preview
SET "ProductVersionId" = version."ProductVersionId"
FROM "ProductVersions" AS version
WHERE preview."ProductId" = version."ProductId" AND version."IsCurrent" = TRUE;

CREATE INDEX "IX_ProductFiles_ProductVersionId" ON "ProductFiles" ("ProductVersionId");
CREATE INDEX "IX_ProductPreviews_ProductVersionId" ON "ProductPreviews" ("ProductVersionId");
