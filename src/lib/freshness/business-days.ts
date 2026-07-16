const DAY_MS = 86_400_000;

export function businessDaysSince(date: string, now = new Date()): number {
  const start = new Date(`${date}T12:00:00Z`);
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
  if (!Number.isFinite(start.getTime()) || start >= end) return 0;

  let count = 0;
  for (let time = start.getTime() + DAY_MS; time <= end.getTime(); time += DAY_MS) {
    const day = new Date(time).getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

export function isMarketDataStale(
  date: string,
  category: "equity" | "volatility" | "rate" | "fx" | "commodity" | "flow",
  now = new Date(),
) {
  const limit = category === "rate" ? 3 : category === "fx" ? 3 : 2;
  return businessDaysSince(date, now) > limit;
}
