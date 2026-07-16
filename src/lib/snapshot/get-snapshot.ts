import { mockSnapshot } from "../../data/mock-snapshot";
import type { DataCollectionError, MarketIndicator, MorningMarketSnapshot } from "../../types/market";
import { applyFredSeries, fetchFredSeries } from "../providers/fred";
import { assertMorningMarketSnapshot } from "../validation/snapshot";

const liveIds = ["sp500", "nasdaq", "dow", "sox", "vix", "us2y", "us10y", "usdkrw", "dxy", "usdjpy", "usdcny", "wti"];

function kstNow() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${now.toISOString().slice(0, -1)}+09:00`;
}

function summary(indicators: MarketIndicator[]) {
  const byId = (id: string) => indicators.find((item) => item.id === id);
  const sp500 = byId("sp500")?.changePercent ?? 0;
  const nasdaq = byId("nasdaq")?.changePercent ?? 0;
  const sox = byId("sox")?.changePercent ?? 0;
  const usdKrw = byId("usdkrw")?.change ?? 0;
  const us10y = byId("us10y")?.change ?? 0;
  return [
    `미국 증시는 S&P 500 ${sp500 >= 0 ? "상승" : "하락"}, 나스닥 ${nasdaq >= 0 ? "상승" : "하락"} 흐름으로 마감했습니다.`,
    `반도체 지수는 전일 대비 ${sox >= 0 ? "강세" : "약세"}였고, 미 10년물 금리는 ${us10y >= 0 ? "상승" : "하락"}했습니다.`,
    `원/달러 환율은 직전 관측값보다 ${Math.abs(usdKrw).toFixed(2)}원 ${usdKrw >= 0 ? "올랐습니다" : "내렸습니다"}.`,
  ];
}

export async function getMorningMarketSnapshot(): Promise<MorningMarketSnapshot> {
  const generatedAt = kstNow();
  const results = await Promise.allSettled(liveIds.map(async (id) => ({ id, ...(await fetchFredSeries(id)) })));
  const live = new Map<string, { seriesId: string; points: Awaited<ReturnType<typeof fetchFredSeries>>["points"] }>();
  const errors: DataCollectionError[] = [];

  results.forEach((result, index) => {
    const id = liveIds[index];
    if (result.status === "fulfilled") live.set(id, result.value);
    else errors.push({ provider: `FRED:${id}`, message: result.reason instanceof Error ? result.reason.message : "알 수 없는 수집 오류", occurredAt: generatedAt });
  });

  const indicators = mockSnapshot.indicators.map((base) => {
    const data = live.get(base.id);
    if (!data) return { ...base, isStale: true, status: "stale" as const, source: `${base.source} · 대체 데이터` };
    return applyFredSeries(base, data.seriesId, data.points);
  });

  const us2y = indicators.find((item) => item.id === "us2y");
  const us10y = indicators.find((item) => item.id === "us10y");
  const spreadIndex = indicators.findIndex((item) => item.id === "spread");
  if (us2y?.value != null && us10y?.value != null && spreadIndex >= 0) {
    const value = Math.round((us10y.value - us2y.value) * 100);
    const previous = Math.round(((us10y.previousValue ?? us10y.value) - (us2y.previousValue ?? us2y.value)) * 100);
    indicators[spreadIndex] = { ...indicators[spreadIndex], value, previousValue: previous, change: value - previous, source: "FRED 금리차 계산", asOf: us10y.asOf, isStale: us10y.isStale || us2y.isStale, recentSeries: us10y.recentSeries.map((point, index) => ({ date: point.date, value: Math.round((point.value - (us2y.recentSeries[index]?.value ?? point.value)) * 100) })) };
  }

  const snapshot: MorningMarketSnapshot = {
    ...mockSnapshot,
    generatedAt,
    marketDate: generatedAt.slice(0, 10),
    collectionStatus: live.size === liveIds.length ? "partial" : live.size === 0 ? "failed" : "partial",
    summary: summary(indicators),
    indicators,
    errors,
  };
  assertMorningMarketSnapshot(snapshot);
  return snapshot;
}
