export function calculateChange(value: number | null, previous: number | null) {
  if (value === null || previous === null) return null;
  return Number((value - previous).toFixed(4));
}

export function calculatePercentageChange(
  value: number | null,
  previous: number | null,
) {
  if (value === null || previous === null || previous === 0) return null;
  return Number((((value - previous) / previous) * 100).toFixed(2));
}

export function calculateBasisPoints(
  value: number | null,
  previous: number | null,
) {
  if (value === null || previous === null) return null;
  return Math.round((value - previous) * 100);
}
