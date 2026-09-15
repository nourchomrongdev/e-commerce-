WITH ranked_cards AS (
  SELECT
    "CardInfoId",
    ROW_NUMBER() OVER (
      PARTITION BY "StorefrontId"
      ORDER BY "CreatedAt" ASC, "CardInfoId" ASC
    ) AS position
  FROM "CardInfo"
  WHERE "StorefrontId" IS NOT NULL
)
UPDATE "CardInfo" AS card
SET "PrimaryMethod" = CASE
  WHEN ranked_cards.position = 1 THEN 'Credit Card'
  ELSE 'Secondary'
END
FROM ranked_cards
WHERE card."CardInfoId" = ranked_cards."CardInfoId";
