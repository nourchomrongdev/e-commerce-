CREATE OR REPLACE FUNCTION normalize_product_name_to_lowercase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."ProductName" := lower(btrim(NEW."ProductName"));
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_store_name_to_lowercase()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."StoreName" := lower(btrim(NEW."StoreName"));
    RETURN NEW;
END;
$$;

UPDATE "Products"
SET "ProductName" = lower(btrim("ProductName"))
WHERE "ProductName" IS DISTINCT FROM lower(btrim("ProductName"));

UPDATE "Storefronts"
SET "StoreName" = lower(btrim("StoreName"))
WHERE "StoreName" IS DISTINCT FROM lower(btrim("StoreName"));

DROP TRIGGER IF EXISTS "TR_Products_NormalizeNameLowercase" ON "Products";
CREATE TRIGGER "TR_Products_NormalizeNameLowercase"
BEFORE INSERT OR UPDATE OF "ProductName" ON "Products"
FOR EACH ROW
EXECUTE FUNCTION normalize_product_name_to_lowercase();

DROP TRIGGER IF EXISTS "TR_Storefronts_NormalizeNameLowercase" ON "Storefronts";
CREATE TRIGGER "TR_Storefronts_NormalizeNameLowercase"
BEFORE INSERT OR UPDATE OF "StoreName" ON "Storefronts"
FOR EACH ROW
EXECUTE FUNCTION normalize_store_name_to_lowercase();