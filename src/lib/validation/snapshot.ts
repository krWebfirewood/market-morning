import type { MorningMarketSnapshot } from "../../types/market";

export function isMorningMarketSnapshot(value: unknown): value is MorningMarketSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<MorningMarketSnapshot>;
  return (
    typeof snapshot.generatedAt === "string" &&
    typeof snapshot.marketDate === "string" &&
    ["success", "partial", "failed"].includes(snapshot.collectionStatus ?? "") &&
    Array.isArray(snapshot.summary) &&
    Array.isArray(snapshot.indicators) &&
    snapshot.indicators.every(
      (item) =>
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        (typeof item?.value === "number" || item?.value === null) &&
        Array.isArray(item?.recentSeries),
    ) &&
    Array.isArray(snapshot.events) &&
    Array.isArray(snapshot.disclosures) &&
    Array.isArray(snapshot.errors)
  );
}

export function assertMorningMarketSnapshot(
  value: unknown,
): asserts value is MorningMarketSnapshot {
  if (!isMorningMarketSnapshot(value)) {
    throw new Error("정규화된 시장 스냅샷 형식이 올바르지 않습니다.");
  }
}
