import type { MarketIndicator, TimeSeriesPoint } from "../../types/market";
import { applyFredSeries } from "./fred";

const symbols: Record<string, string> = {
  kospi: "^KS11",
  kosdaq: "^KQ11",
  gold: "GC=F",
  copper: "HG=F",
};

interface YahooChartResponse {
  chart?: {
    error?: { description?: string } | null;
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }> | null;
  };
}

export async function fetchYahooMarketSeries(
  indicatorId: string,
): Promise<{ symbol: string; points: TimeSeriesPoint[] }> {
  const symbol = symbols[indicatorId];
  if (!symbol) throw new Error(`Yahoo Finance에 등록되지 않은 지표입니다: ${indicatorId}`);

  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`,
    {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MarketMorning/1.0)" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8_000),
    },
  );
  const payload = (await response.json()) as YahooChartResponse;
  if (!response.ok) {
    throw new Error(payload.chart?.error?.description ?? `Yahoo Finance 응답 오류: ${response.status}`);
  }

  const result = payload.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const points = timestamps.flatMap((timestamp, index) => {
    const value = closes[index];
    if (value == null || !Number.isFinite(value)) return [];
    return [{
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      value: Number(value.toFixed(4)),
    }];
  });
  if (points.length < 2) throw new Error(`Yahoo Finance ${symbol} 유효 관측값 부족`);

  return { symbol, points };
}

export function applyYahooMarketSeries(
  base: MarketIndicator,
  symbol: string,
  points: TimeSeriesPoint[],
) {
  const normalized = applyFredSeries(base, symbol, points);
  return {
    ...normalized,
    source: `Yahoo Finance · ${symbol}`,
    sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`,
  };
}
