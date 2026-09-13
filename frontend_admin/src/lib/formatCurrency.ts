export function formatCompactCurrency(value: string) {
  const amount = Number(value.replace(/[$,]/g, ""));

  if (!Number.isFinite(amount)) return value;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}
