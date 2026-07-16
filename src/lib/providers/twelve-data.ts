import type { MarketIndicator, TimeSeriesPoint } from "../../types/market";
import { applyFredSeries } from "./fred";

const symbols: Record<string, string> = {
  kospi: process.env.TWELVE_DATA_KOSPI_SYMBOL ?? "KS11",
  kosdaq: process.env.TWELVE_DATA_KOSDAQ_SYMBOL ?? "KQ11",
  gold: process.env.TWELVE_DATA_GOLD_SYMBOL ?? "XAU/USD",
  copper: process.env.TWELVE_DATA_COPPER_SYMBOL ?? "XCU/USD",
};

interface TwelveDataResponse {
  status?: string;
  message?: string;
  values?: Array<{ datetime: string; close: string }>;
}

export async function fetchTwelveDataSeries(
  indicatorId: string,
): Promise<{ symbol: string; points: TimeSeriesPoint[] }> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) throw new Error("TWELVE_DATA_API_KEY가 설정되지 않았습니다.");
  const symbol = symbols[indicatorId];
  if (!symbol) throw new Error(`Twelve Data 심볼이 없는 지표입니다: ${indicatorId}`);

  const params = new URLSearchParams({
    symbol,
    interval: "1day",
    outputsize: "20",
    apikey: apiKey,
    order: "asc",
  });
  const response = await fetch(`https://api.twelvedata.com/time_series?${params}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Twelve Data 응답 오류: ${response.status}`);

  const payload = (await response.json()) as TwelveDataResponse;
  if (payload.status === "error" || !payload.values) {
    throw new Error(payload.message ?? `Twelve Data ${symbol} 유효 응답 없음`);
  }
  const points = payload.values
    .map(({ datetime, close }) => ({ date: datetime.slice(0, 10), value: Number(close) }))
    .filter((point) => Number.isFinite(point.value));
  if (points.length < 2) throw new Error(`Twelve Data ${symbol} 유효 관측값 부족`);
  return { symbol, points };
}

export function applyTwelveDataSeries(
  base: MarketIndicator,
  symbol: string,
  points: TimeSeriesPoint[],
) {
  const normalized = applyFredSeries(base, symbol, points);
  return {
    ...normalized,
    source: `Twelve Data · ${symbol}`,
    sourceUrl: "https://twelvedata.com/",
  };
}
